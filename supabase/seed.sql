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
  (1, 'Begin',          'Create your account',                                   0,  0,  0,  0),
  (2, 'Explorer',       'Start your practice with sessions and events',           2,  1,  0,  0),
  (3, 'Practitioner',   'Deepen through sessions and consistent meditation',      4,  0,  5,  0),
  (4, 'Steady Seeker',  'Integrate sessions, events and daily meditation',        6,  2, 10,  0),
  (5, 'Deepening',      'Expand your commitment across all dimensions',           8,  3, 15,  0),
  (6, 'Retreat Path',   'Embrace immersive retreat experiences',                 10,  1, 21,  1),
  (7, 'Inner Core',     'Full integration — a consistent embodied practice',     12,  4, 30,  0)
on conflict (level) do update set
  name = excluded.name,
  description = excluded.description,
  required_sessions = excluded.required_sessions,
  required_events = excluded.required_events,
  required_meditation_days = excluded.required_meditation_days,
  required_retreats = excluded.required_retreats;

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
insert into public.events (id, title, slug, category, format, description, city, venue, starts_at, ends_at, registration_url, is_featured, is_published)
values
  (
    'a1b2c3d4-0001-0000-0000-000000000001',
    'Kirtan Vibing',
    'kirtan-vibing',
    'Music',
    'Event',
    'Music • Mantra • Meditation — Open to everyone',
    'Bengaluru',
    'Devas Studio',
    (now() + interval '15 days')::timestamptz,
    (now() + interval '15 days' + interval '3 hours')::timestamptz,
    'https://devasunlimited.com/events/kirtan-vibing',
    true,
    true
  ),
  (
    'a1b2c3d4-0002-0000-0000-000000000002',
    'Full Moon Meditation',
    'full-moon-meditation',
    'Live',
    'Live',
    'A collective meditation under the full moon energy',
    'Online',
    'Zoom',
    (now() + interval '10 days')::timestamptz,
    (now() + interval '10 days' + interval '1 hour')::timestamptz,
    'https://devasunlimited.com/events/full-moon',
    false,
    true
  ),
  (
    'a1b2c3d4-0003-0000-0000-000000000003',
    'Kannur Mystic Retreat',
    'kannur-mystic-retreat',
    'Retreat',
    'Retreat',
    'A 3-day immersive retreat in the mystical landscapes of Kannur',
    'Kannur',
    'Kannur Heritage Resort',
    (now() + interval '55 days')::timestamptz,
    (now() + interval '58 days')::timestamptz,
    'https://devasunlimited.com/events/kannur-retreat',
    false,
    true
  ),
  (
    'a1b2c3d4-0004-0000-0000-000000000004',
    'Energy Healing Session',
    'energy-healing-session',
    'Session',
    'Live',
    'Group energy healing and pranic clearing with guided breathwork',
    'Online',
    'Zoom',
    (now() + interval '20 days')::timestamptz,
    (now() + interval '20 days' + interval '90 minutes')::timestamptz,
    'https://devasunlimited.com/events/energy-healing',
    false,
    true
  )
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────
-- SANCTUARY RESOURCES
-- ─────────────────────────────────────────────
insert into public.resources (id, title, category, provider, external_url, thumbnail_url, duration_minutes, description, is_featured, is_published, published_at)
values
  (
    'b1b2c3d4-0001-0000-0000-000000000001',
    'The Art of Letting Go',
    'watch',
    'youtube',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    null,
    12,
    'Wisdom Talk',
    true,
    true,
    now()
  ),
  (
    'b1b2c3d4-0002-0000-0000-000000000002',
    'Stillness Before Sleep',
    'listen',
    'soundcloud',
    'https://soundcloud.com/devasunlimited/stillness-before-sleep',
    null,
    18,
    'Guided Audio',
    false,
    true,
    now()
  ),
  (
    'b1b2c3d4-0003-0000-0000-000000000003',
    'Return to Your Inner Core',
    'meditate',
    'meditation',
    'https://devasunlimited.com/sanctuary/inner-core',
    null,
    10,
    'Practice',
    false,
    true,
    now()
  ),
  (
    'b1b2c3d4-0004-0000-0000-000000000004',
    'Morning Mantra Flow',
    'listen',
    'spotify',
    'https://open.spotify.com/playlist/devasunlimited',
    null,
    25,
    'Mantra Music',
    false,
    true,
    now()
  )
on conflict (id) do nothing;

-- ─────────────────────────────────────────────
-- SAMPLE SESSIONS (requires a real user ID)
-- ─────────────────────────────────────────────
-- INSTRUCTIONS:
-- 1. Create a user with email: madhavika@devasunlimited.com
--    via Supabase Auth dashboard (Authentication > Users > Invite User)
-- 2. Copy the user UUID and replace REPLACE_WITH_USER_UUID below
-- 3. Run this section of the seed after replacing the UUID

-- Example (uncomment and replace UUID after creating user):
/*
do $$
declare
  v_user_id uuid := 'REPLACE_WITH_USER_UUID';
  v_session_1 uuid := uuid_generate_v4();
  v_session_2 uuid := uuid_generate_v4();
  v_session_3 uuid := uuid_generate_v4();
  v_session_4 uuid := uuid_generate_v4();
begin
  -- Sessions
  insert into public.client_sessions (id, title, session_kind, coach_name, starts_at, duration_minutes, status, recording_status)
  values
    (v_session_1, '1:1 Coaching Session', '1on1', 'Coach Name', now() - interval '20 days', 60, 'completed', 'available'),
    (v_session_2, 'Group Meditation',      'group', 'Coach Name', now() - interval '27 days', 60, 'completed', 'available'),
    (v_session_3, '1:1 Coaching Session', '1on1', 'Coach Name', now() - interval '35 days', 60, 'completed', 'none'),
    (v_session_4, 'Breathwork Transformation', 'group', 'Coach Name', now() - interval '45 days', 90, 'completed', 'available');

  -- Session participants
  insert into public.session_participants (session_id, user_id, attendance_status, personal_reflection_note, practice_suggestion)
  values
    (v_session_1, v_user_id, 'attended', 'Notice what softens when you stop trying to solve everything at once', '10 min mindful pause'),
    (v_session_2, v_user_id, 'attended', null, 'Daily 5-minute body scan'),
    (v_session_3, v_user_id, 'attended', 'Trust the unfolding', null),
    (v_session_4, v_user_id, 'attended', 'Breath is the anchor', '4-7-8 breathing before sleep');

  -- Event participation
  insert into public.event_participants (event_id, user_id, registration_status, attendance_status, attended_at)
  values
    ('a1b2c3d4-0002-0000-0000-000000000002', v_user_id, 'registered', 'attended', now() - interval '10 days'),
    ('a1b2c3d4-0004-0000-0000-000000000004', v_user_id, 'registered', 'attended', now() - interval '5 days');

  -- Meditation history (last 30 days)
  for i in 1..20 loop
    insert into public.meditation_sessions (user_id, started_at, completed_at, duration_seconds, intention, status)
    values (
      v_user_id,
      now() - (i * interval '1.5 days'),
      now() - (i * interval '1.5 days') + interval '10 minutes',
      600 + (random() * 900)::int,
      case (i % 5)
        when 0 then 'Stillness before reaction'
        when 1 then 'Open and present'
        when 2 then 'Grateful and grounded'
        when 3 then 'Soft and curious'
        else 'Peaceful within'
      end,
      'completed'
    );
  end loop;
end$$;
*/
