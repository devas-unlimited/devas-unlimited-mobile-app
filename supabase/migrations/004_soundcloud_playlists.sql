-- ============================================================
-- Devas Unlimited — Real Sanctuary audio playlists (004)
-- ============================================================
-- 1. Adds track_count to resources (used for playlist cards)
-- 2. Removes the placeholder/dummy sanctuary resources from seed
-- 3. Adds the official Devas Unlimited SoundCloud playlists
-- ============================================================

alter table public.resources
  add column if not exists track_count integer check (track_count is null or track_count >= 0);

-- Remove dummy seed resources
delete from public.resources
where id in (
  'b1b2c3d4-0001-0000-0000-000000000001',
  'b1b2c3d4-0002-0000-0000-000000000002',
  'b1b2c3d4-0003-0000-0000-000000000003',
  'b1b2c3d4-0004-0000-0000-000000000004'
);

-- Official SoundCloud playlists (Listen tab)
insert into public.resources
  (id, title, category, provider, external_url, thumbnail_url, duration_minutes, track_count, description, facilitator_name, is_featured, is_published, status, display_order, published_at)
values
  (
    'c1d2e3f4-0001-0000-0000-000000000001',
    'Navratri Mantras',
    'listen', 'soundcloud',
    'https://soundcloud.com/devas-unlimited/sets/navratri-mantras-meditation',
    'https://i1.sndcdn.com/artworks-lxypkwOyAwv2Z5Y9-wStJYA-t500x500.jpg',
    11, 10,
    'Mantras for each of the nine sacred nights of Navratri, honouring the forms of the Divine Mother.',
    'Devas Unlimited',
    true, true, 'published', 1, now()
  ),
  (
    'c1d2e3f4-0002-0000-0000-000000000002',
    'Loving God — Guided Meditations',
    'listen', 'soundcloud',
    'https://soundcloud.com/devas-unlimited/sets/loving-god-guided-meditations',
    'https://i1.sndcdn.com/artworks-000207446470-x0b5xk-t500x500.jpg',
    13, 3,
    'Connect with the Divine love that you are, with these 3 parts guided meditation.',
    'Devas Unlimited',
    false, true, 'published', 2, now()
  ),
  (
    'c1d2e3f4-0003-0000-0000-000000000003',
    'Meditations from the Cutting Ties Method',
    'listen', 'soundcloud',
    'https://soundcloud.com/devas-unlimited/sets/meditations-from-the-cutting',
    'https://i1.sndcdn.com/artworks-000205473427-ahjsdi-t500x500.jpg',
    33, 4,
    'Step up your daily practice of meditations from the Cutting Ties Method, with the aid of these high quality audios.',
    'Devas Unlimited',
    false, true, 'published', 3, now()
  ),
  (
    'c1d2e3f4-0004-0000-0000-000000000004',
    '8/9th Retreat',
    'listen', 'soundcloud',
    'https://soundcloud.com/devas-unlimited/sets/8-9th-retreat',
    'https://i1.sndcdn.com/artworks-000068243188-1t5uf9-t500x500.jpg',
    20, 2,
    'Kirtan from the 8/9th retreat — Om Namah Shivaya and Bhaj Govinda.',
    'Devas Unlimited',
    false, true, 'published', 4, now()
  ),
  (
    'c1d2e3f4-0005-0000-0000-000000000005',
    'Sailent Retreat — USA 2012',
    'listen', 'soundcloud',
    'https://soundcloud.com/devas-unlimited/sets/sailent-retreat-usa-2012-talks-by-dr-srikanth-sola',
    'https://i1.sndcdn.com/artworks-000184652234-qk9m1t-t500x500.jpg',
    321, 5,
    'Recordings of talks by Dr Srikanth Sola at the North Eastern Region Sailent Retreat in USA, held in 2012.',
    'Dr Srikanth Sola',
    false, true, 'published', 5, now()
  )
on conflict (id) do update set
  title            = excluded.title,
  category         = excluded.category,
  provider         = excluded.provider,
  external_url     = excluded.external_url,
  thumbnail_url    = excluded.thumbnail_url,
  duration_minutes = excluded.duration_minutes,
  track_count      = excluded.track_count,
  description      = excluded.description,
  facilitator_name = excluded.facilitator_name,
  is_featured      = excluded.is_featured,
  is_published     = excluded.is_published,
  status           = excluded.status,
  display_order    = excluded.display_order,
  updated_at       = now();
