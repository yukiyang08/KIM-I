-- ============================================================
-- 語音聊天個人化設定：user_voice_profiles
-- 透過語音聊天蒐集長輩的個人化資料（興趣、家人、常去地點、愛吃小吃）
-- ============================================================

create table if not exists public.user_voice_profiles (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null unique,

  -- 結構化擷取欄位（由 LLM 從逐字稿分析而來）
  -- interests:        ["唱歌", "下棋", "種花"]
  -- family_members:   [{"name": "小明", "relation": "孫子"}]
  -- favorite_places:  ["廟口", "公園", "菜市場"]
  -- favorite_snacks:  ["蚵仔煎", "肉圓", "豆花"]
  interests        jsonb       not null default '[]',
  family_members   jsonb       not null default '[]',
  favorite_places  jsonb       not null default '[]',
  favorite_snacks  jsonb       not null default '[]',

  -- 完整對話逐字稿 [{"role": "assistant"|"user", "content": "..."}]
  transcript       jsonb       not null default '[]',

  -- 四個欄位都蒐集到至少一筆即為 true
  is_complete      boolean     not null default false,

  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create index if not exists idx_voice_profiles_user on public.user_voice_profiles (user_id);

-- 自動更新 updated_at
create or replace function public.touch_voice_profile()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_touch_voice_profile on public.user_voice_profiles;
create trigger trg_touch_voice_profile
  before update on public.user_voice_profiles
  for each row execute function public.touch_voice_profile();

-- RLS（與專案其他表一致：開放政策，因為有未登入的訪客模式）
alter table public.user_voice_profiles enable row level security;

drop policy if exists "voice_profiles_open" on public.user_voice_profiles;
create policy "voice_profiles_open" on public.user_voice_profiles
  for all using (true) with check (true);
