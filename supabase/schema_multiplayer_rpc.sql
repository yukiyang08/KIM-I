-- ============================================================
-- KIM-I Multiplayer Atomic RPC Functions
-- (already applied to the remote project as migration
--  "multiplayer_atomic_player_ops" — kept here for reference)
--
-- Why: the old client code read the whole `players` jsonb array,
-- modified it in JS, and wrote the whole array back. Two players
-- acting at the same time (join / ready / score) overwrote each
-- other's changes. These functions mutate only the calling
-- player's entry inside a row lock, so concurrent ops are safe.
-- ============================================================

create or replace function public.mp_join_room(p_code text, p_player jsonb)
returns setof public.multiplayer_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.multiplayer_rooms%rowtype;
  v_exists boolean;
begin
  select * into v_room
    from public.multiplayer_rooms
   where code = upper(trim(p_code))
   for update;

  if not found then
    return; -- empty set => room not found
  end if;

  if v_room.status <> 'waiting' then
    raise exception 'ROOM_NOT_WAITING';
  end if;

  v_exists := exists (
    select 1 from jsonb_array_elements(v_room.players) p
    where p->>'id' = p_player->>'id');

  if not v_exists and jsonb_array_length(v_room.players) >= v_room.max_players then
    raise exception 'ROOM_FULL';
  end if;

  if v_exists then
    update public.multiplayer_rooms
       set players = (
             select jsonb_agg(
               case when p->>'id' = p_player->>'id'
                 then p || jsonb_build_object(
                        'name', p_player->'name',
                        'connectedAt', p_player->'connectedAt')
                 else p end)
             from jsonb_array_elements(players) p),
           updated_at = now()
     where id = v_room.id;
  else
    update public.multiplayer_rooms
       set players = players || jsonb_build_array(p_player),
           updated_at = now()
     where id = v_room.id;
  end if;

  return query select * from public.multiplayer_rooms where id = v_room.id;
end $$;

create or replace function public.mp_set_ready(p_room_id uuid, p_player_id text, p_ready boolean)
returns setof public.multiplayer_rooms
language sql
security definer
set search_path = public
as $$
  update public.multiplayer_rooms
     set players = (
           select coalesce(jsonb_agg(
             case when p->>'id' = p_player_id
               then jsonb_set(p, '{ready}', to_jsonb(p_ready))
               else p end), '[]'::jsonb)
           from jsonb_array_elements(players) p),
         updated_at = now()
   where id = p_room_id
     and status = 'waiting'
  returning *;
$$;

create or replace function public.mp_leave_room(p_room_id uuid, p_player_id text)
returns setof public.multiplayer_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.multiplayer_rooms%rowtype;
  v_players jsonb;
  v_host text;
begin
  select * into v_room
    from public.multiplayer_rooms
   where id = p_room_id
   for update;

  if not found then
    return;
  end if;

  v_players := coalesce((
    select jsonb_agg(p)
    from jsonb_array_elements(v_room.players) p
    where p->>'id' <> p_player_id), '[]'::jsonb);

  if jsonb_array_length(v_players) = 0 then
    delete from public.multiplayer_rooms where id = p_room_id;
    return;
  end if;

  v_host := case when v_room.host_player_id = p_player_id
                 then v_players->0->>'id'
                 else v_room.host_player_id end;

  return query
    update public.multiplayer_rooms
       set players = v_players,
           host_player_id = v_host,
           updated_at = now()
     where id = p_room_id
    returning *;
end $$;

create or replace function public.mp_submit_score(p_room_id uuid, p_player_id text, p_score int)
returns setof public.multiplayer_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_players jsonb;
  v_all_done boolean;
begin
  -- lock the row so concurrent submissions serialize
  perform 1 from public.multiplayer_rooms where id = p_room_id for update;
  if not found then
    return;
  end if;

  update public.multiplayer_rooms
     set players = (
           select jsonb_agg(
             case when p->>'id' = p_player_id
               then p || jsonb_build_object(
                      'score', greatest(0, p_score),
                      'finishedAt', (extract(epoch from now()) * 1000)::bigint)
               else p end)
           from jsonb_array_elements(players) p),
         updated_at = now()
   where id = p_room_id
  returning players into v_players;

  v_all_done := (
    select bool_and(coalesce(p->>'finishedAt', '') <> '' and p->>'finishedAt' <> 'null')
    from jsonb_array_elements(v_players) p);

  if v_all_done then
    update public.multiplayer_rooms
       set status = 'finished',
           ended_at = now(),
           updated_at = now()
     where id = p_room_id;
  end if;

  return query select * from public.multiplayer_rooms where id = p_room_id;
end $$;

create or replace function public.mp_live_score(p_room_id uuid, p_player_id text, p_score int)
returns void
language sql
security definer
set search_path = public
as $$
  update public.multiplayer_rooms
     set players = (
           select coalesce(jsonb_agg(
             case when p->>'id' = p_player_id
               then jsonb_set(p, '{liveScore}', to_jsonb(greatest(0, p_score)))
               else p end), '[]'::jsonb)
           from jsonb_array_elements(players) p),
         updated_at = now()
   where id = p_room_id
     and status = 'playing';
$$;

create or replace function public.mp_start_game(p_room_id uuid, p_host_id text)
returns setof public.multiplayer_rooms
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.multiplayer_rooms%rowtype;
begin
  select * into v_room
    from public.multiplayer_rooms
   where id = p_room_id
   for update;

  if not found then
    raise exception 'ROOM_NOT_FOUND';
  end if;
  if v_room.host_player_id <> p_host_id then
    raise exception 'NOT_HOST';
  end if;
  if jsonb_array_length(v_room.players) < 2 then
    raise exception 'NEED_TWO_PLAYERS';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_room.players) p
    where coalesce((p->>'ready')::boolean, false) = false) then
    raise exception 'NOT_ALL_READY';
  end if;

  return query
    update public.multiplayer_rooms
       set status = 'playing',
           started_at = now(),
           ended_at = null,
           updated_at = now(),
           players = (
             select jsonb_agg(p || '{"score": null, "finishedAt": null, "liveScore": null}'::jsonb)
             from jsonb_array_elements(v_room.players) p)
     where id = p_room_id
    returning *;
end $$;

grant execute on function
  public.mp_join_room(text, jsonb),
  public.mp_set_ready(uuid, text, boolean),
  public.mp_leave_room(uuid, text),
  public.mp_submit_score(uuid, text, int),
  public.mp_live_score(uuid, text, int),
  public.mp_start_game(uuid, text)
to anon, authenticated;
