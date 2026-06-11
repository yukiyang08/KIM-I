-- ============================================================
-- KIM-I Multiplayer Rooms Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

create table if not exists public.multiplayer_rooms (
  id              uuid        primary key default gen_random_uuid(),
  code            text        not null unique,
  mode            text        not null default 'co-op',     -- co-op | versus | assist
  track           text        not null default 'music-rhythm2',
  max_players     int         not null default 4 check (max_players >= 2 and max_players <= 30),
  duration        text        not null default '60',        -- '60' | '120' | 'all'
  difficulty      text        not null default 'normal' check (difficulty in ('easy', 'normal', 'hard')),
  host_player_id  text        not null,                    -- local session ID (not auth)
  status          text        not null default 'waiting',   -- waiting | playing | finished
  players         jsonb       not null default '[]',
  started_at      timestamptz,
  ended_at        timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-clean rooms older than 2 hours (optional: run as a cron job in Supabase)
-- delete from public.multiplayer_rooms where created_at < now() - interval '2 hours';

-- Index for code lookup (used by joinRoomByCode)
create index if not exists idx_multiplayer_rooms_code on public.multiplayer_rooms (code);

-- Index for listing active rooms
create index if not exists idx_multiplayer_rooms_status on public.multiplayer_rooms (status, created_at desc);

-- ── RLS ──────────────────────────────────────────────────────────────────────
alter table public.multiplayer_rooms enable row level security;

-- Anyone can read rooms (guests included — no auth required for multiplayer)
create policy "rooms: read all" on public.multiplayer_rooms
  for select using (true);

-- Anyone can insert (create a room)
create policy "rooms: insert all" on public.multiplayer_rooms
  for insert with check (true);

-- Anyone can update (join, toggle ready, start, etc.)
create policy "rooms: update all" on public.multiplayer_rooms
  for update using (true);

-- Anyone can delete (leaving an empty room removes it)
create policy "rooms: delete all" on public.multiplayer_rooms
  for delete using (true);

-- ── Realtime ─────────────────────────────────────────────────────────────────
-- Enable Realtime for this table in Supabase Dashboard:
-- Database → Replication → supabase_realtime → Add table → multiplayer_rooms
