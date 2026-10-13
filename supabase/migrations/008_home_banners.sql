-- ============================================================
-- Devas Unlimited — Home banners slider (008)
-- ============================================================
-- Admin-managed banners shown in the Home "Highlights" slider.
-- Featured events/announcements are appended automatically by the app.
-- ============================================================

create table if not exists public.home_banners (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  subtitle       text,
  eyebrow        text,
  image_url      text,
  -- cover: image fills the banner (text over it) | side: image/logo sits on the right
  image_mode     text not null default 'cover' check (image_mode in ('cover', 'side')),
  theme          text not null default 'plum' check (theme in ('plum', 'rose', 'lavender', 'gold', 'cream')),
  cta_label      text,
  -- https://… opens in a browser tab, /path opens a screen inside the app
  link_url       text check (link_url is null or link_url ~ '^(https?://|/)'),
  display_order  integer not null default 0,
  is_active      boolean not null default true,
  starts_at      timestamptz,
  ends_at        timestamptz,
  created_by     uuid references auth.users(id),
  updated_by     uuid references auth.users(id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create index if not exists idx_home_banners_order on public.home_banners (display_order);

alter table public.home_banners enable row level security;

create policy "Authenticated users can read live banners"
  on public.home_banners for select
  to authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

create policy "Admins can manage banners"
  on public.home_banners for all
  using (public.is_admin())
  with check (public.is_admin());

-- Love Rocks (sister brand) — previously hard-coded in the app, now editable
insert into public.home_banners
  (id, eyebrow, title, subtitle, image_url, image_mode, theme, cta_label, link_url, display_order, is_active)
values (
  'd1e2f3a4-0001-0000-0000-000000000001',
  'Our sister brand',
  'Healing crystals & jewellery',
  'Handcrafted with intention by Love Rocks',
  '/brand/loverocks-logo.png',
  'side', 'cream',
  'Shop loverocks.in',
  'https://loverocks.in/?utm_source=devas_app&utm_medium=app&utm_campaign=home_banner',
  100, true
)
on conflict (id) do nothing;
