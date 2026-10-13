-- ============================================================
-- Devas Unlimited — Journey levels v2 + journey cycles (005)
-- ============================================================
-- 1. New requirements for each journey level
-- 2. journey_completions: when a user completes the final level
--    their journey is "well done" and the map restarts — progress
--    only counts activity after their latest completion.
-- 3. Removes the dummy/seed journey data (sample sessions, event
--    attendance and meditation history inserted by seed.sql)
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. LEVEL REQUIREMENTS
-- ─────────────────────────────────────────────
insert into public.journey_levels (level, name, description, required_sessions, required_events, required_meditation_days, required_retreats)
values
  (1, 'Begin',          'Create your account',                                   0,  0,   0, 0),
  (2, 'Explorer',       'Start your practice with sessions and events',           2,  1,   0, 0),
  (3, 'Practitioner',   'Deepen through sessions and consistent meditation',      5,  0,  10, 0),
  (4, 'Steady Seeker',  'Integrate sessions, events and daily meditation',        6,  3,  30, 0),
  (5, 'Deepening',      'Expand your commitment across all dimensions',          10,  6,  90, 1),
  (6, 'Retreat Path',   'Embrace immersive retreat experiences',                 15,  6, 120, 3),
  (7, 'Inner Core',     'Full integration — a consistent embodied practice',     20, 10, 150, 5)
on conflict (level) do update set
  name                     = excluded.name,
  description              = excluded.description,
  required_sessions        = excluded.required_sessions,
  required_events          = excluded.required_events,
  required_meditation_days = excluded.required_meditation_days,
  required_retreats        = excluded.required_retreats;

-- ─────────────────────────────────────────────
-- 2. JOURNEY COMPLETIONS (cycles)
-- ─────────────────────────────────────────────
create table if not exists public.journey_completions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  completed_at  timestamptz not null default now()
);

create index if not exists idx_journey_completions_user on public.journey_completions (user_id, completed_at desc);

alter table public.journey_completions enable row level security;

create policy "Users can read own journey completions"
  on public.journey_completions for select
  using (auth.uid() = user_id);

create policy "Users can record own journey completion"
  on public.journey_completions for insert
  with check (auth.uid() = user_id);

create policy "Admins can read all journey completions"
  on public.journey_completions for select
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- 3. REMOVE DUMMY JOURNEY DATA (from seed.sql)
-- ─────────────────────────────────────────────
-- Sample sessions (session_participants rows cascade)
delete from public.client_sessions
where coach_name = 'Coach Name'
  and title in ('1:1 Coaching Session', 'Group Meditation', 'Breathwork Transformation');

-- Sample event attendance on the seed events
delete from public.event_participants
where event_id in (
  'a1b2c3d4-0002-0000-0000-000000000002',
  'a1b2c3d4-0004-0000-0000-000000000004'
);

-- Sample meditation history. The seed wrote completed_at = started_at + 10 min
-- with a random duration_seconds; real sessions from the app always have
-- completed_at - started_at equal to duration_seconds, so they are untouched.
delete from public.meditation_sessions
where completed_at - started_at = interval '10 minutes'
  and duration_seconds <> 600;
