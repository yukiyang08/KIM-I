-- ============================================================
-- KIM-I Schema
-- 在 Supabase Dashboard → SQL Editor 執行此檔案
-- ============================================================

-- ── users ────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid        primary key default gen_random_uuid(),
  name          text,
  birth_year    integer,
  region        text,
  occupation    text,
  avatar_id     integer     default 1,
  created_at    timestamptz default now()
);

alter table public.users enable row level security;

-- 每個人只能讀/寫自己的資料
create policy "users: self read"   on public.users for select using (auth.uid() = id or id::text = current_setting('request.headers', true)::json->>'x-guest-id' );
create policy "users: self insert" on public.users for insert with check (true);
create policy "users: self update" on public.users for update using (true);

-- ── game_sessions ────────────────────────────────────────────
create table if not exists public.game_sessions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null,
  game_id     text        not null,
  score       integer     not null check (score >= 0 and score <= 100),
  difficulty  text        not null default 'normal',
  detail      jsonb       default '{}',
  played_at   timestamptz default now()
);

create index if not exists idx_game_sessions_user_id on public.game_sessions(user_id);
create index if not exists idx_game_sessions_played_at on public.game_sessions(played_at desc);

alter table public.game_sessions enable row level security;

create policy "sessions: self read"   on public.game_sessions for select using (true);
create policy "sessions: self insert" on public.game_sessions for insert with check (true);
create policy "sessions: self update" on public.game_sessions for update using (true);
