-- ============================================================
-- Devas Unlimited — Remove dummy events & announcements (007)
-- ============================================================
-- Removes the sample events inserted by seed.sql and the test
-- announcements created while trying out the admin panel.
-- Related event_participants / announcement_reads rows cascade.
-- ============================================================

-- Sample events from seed.sql
delete from public.events
where id in (
  'a1b2c3d4-0001-0000-0000-000000000001', -- Kirtan Vibing
  'a1b2c3d4-0002-0000-0000-000000000002', -- Full Moon Meditation
  'a1b2c3d4-0003-0000-0000-000000000003', -- Kannur Mystic Retreat
  'a1b2c3d4-0004-0000-0000-000000000004'  -- Energy Healing Session
);

-- Test announcements created in the admin panel
delete from public.announcements
where title in ('new', 'test test', 'new first announcement');
