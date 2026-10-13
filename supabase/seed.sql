-- ============================================================
-- Devas Unlimited — Seed Data
-- ============================================================
-- NOTE: The seed user (Madhavika) must be created manually via
-- Supabase Auth dashboard or CLI. Then set SEED_USER_ID below.
-- Run: INSERT INTO auth.users ... or use Supabase dashboard.
-- After creating, replace the UUID below with the actual user ID.

-- ─────────────────────────────────────────────
-- JOURNEY LEVELS
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
  name = excluded.name,
  description = excluded.description,
  required_sessions = excluded.required_sessions,
  required_events = excluded.required_events,
  required_meditation_days = excluded.required_meditation_days,
  required_retreats = excluded.required_retreats;

-- ─────────────────────────────────────────────
-- EVENTS & ANNOUNCEMENTS
-- ─────────────────────────────────────────────
-- Real events, retreats and announcements are created in the admin panel.

-- ─────────────────────────────────────────────
-- SANCTUARY RESOURCES
-- ─────────────────────────────────────────────
-- Official Devas Unlimited SoundCloud playlists are inserted by
-- migrations/004_soundcloud_playlists.sql (requires track_count column).

-- Journey progress (sessions, events, meditation) comes from real activity only —
-- no sample journey data is seeded.
