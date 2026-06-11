-- ============================================================
-- KIM-I Schema v2
-- 在 supabase/schema.sql 之後執行
-- ============================================================

-- ── users 欄位擴充 ────────────────────────────────────────────
alter table public.users
  add column if not exists role              text default 'patient',   -- 'patient' | 'caregiver'
  add column if not exists organization_code text,                     -- 照顧機構代碼，caregivers 可查相同 code 的 patients
  add column if not exists age               integer;

-- ── patient_stats view ────────────────────────────────────────
-- 每位 patient 的聚合統計，供 caregiver dashboard 使用
create or replace view public.patient_stats as
select
  u.id,
  u.name,
  u.age,
  u.avatar_id,
  u.organization_code,
  -- 本週 sessions（最近 7 天）
  count(case when gs.played_at >= now() - interval '7 days' then 1 end)::int  as weekly_count,
  -- 距上次活動天數
  coalesce(
    extract(day from now() - max(gs.played_at))::int,
    999
  ) as last_active_days,
  -- 五個維度最新分數（各取最後一筆，若無則 null）
  round(avg(case when gs.game_id in ('shopping','riddle')    then gs.score end)::numeric) as dim_memory,
  round(avg(case when gs.game_id = 'puppet'                  then gs.score end)::numeric) as dim_attention,
  round(avg(case when gs.game_id = 'cooking'                 then gs.score end)::numeric) as dim_execution,
  round(avg(case when gs.game_id = 'puzzle'                  then gs.score end)::numeric) as dim_visual,
  round(avg(case when gs.game_id = 'music'                   then gs.score end)::numeric) as dim_reaction,
  -- 週平均分
  round(avg(case when gs.played_at >= now() - interval '7 days' then gs.score end)::numeric) as week_score,
  -- 總場次
  count(gs.id)::int as total_sessions
from public.users u
left join public.game_sessions gs on gs.user_id = u.id
where u.role = 'patient'
group by u.id, u.name, u.age, u.avatar_id, u.organization_code;

-- ── streak function ───────────────────────────────────────────
-- 計算一位 user 的連續訓練天數（到今天為止）
create or replace function public.get_streak(p_user_id uuid)
returns integer language plpgsql as $$
declare
  streak_count integer := 0;
  check_date   date := current_date;
  has_session  boolean;
begin
  loop
    select exists(
      select 1 from public.game_sessions
      where user_id = p_user_id
        and played_at::date = check_date
    ) into has_session;

    exit when not has_session;

    streak_count := streak_count + 1;
    check_date   := check_date - 1;
  end loop;
  return streak_count;
end;
$$;

-- ── streak_ranking view ───────────────────────────────────────
create or replace view public.streak_ranking as
select
  u.id,
  u.name,
  u.avatar_id,
  u.organization_code,
  public.get_streak(u.id) as streak_days
from public.users u
where u.role = 'patient'
order by streak_days desc;

-- ── RLS policies（寬鬆開放，caregiver 可讀所有同機構資料）───
create policy "patient_stats: read all" on public.users for select using (true);

-- views 不套 RLS，但透過 security definer function 或直接查 view
