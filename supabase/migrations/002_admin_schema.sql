-- ============================================================
-- Devas Unlimited — Admin Schema Migration (002)
-- ============================================================

-- ─────────────────────────────────────────────
-- USER ROLES  (secure, non-user-editable)
-- ─────────────────────────────────────────────
create table if not exists public.user_roles (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  role       text not null check (role in ('client', 'admin', 'super_admin')),
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

create index if not exists idx_user_roles_user_id on public.user_roles (user_id);

alter table public.user_roles enable row level security;

-- Only admins can read the roles table; users cannot read or write their own role
create policy "Admins can read all roles"
  on public.user_roles for select
  using (
    exists (
      select 1 from public.user_roles ur
      where ur.user_id = auth.uid()
      and ur.role in ('admin', 'super_admin')
    )
  );

-- No client-side inserts or updates — roles are granted via migration or service functions only
-- (Supabase service role / dashboard is used to grant roles)

-- ─────────────────────────────────────────────
-- is_admin() HELPER  (used in all admin RLS)
-- ─────────────────────────────────────────────
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'super_admin')
  )
$$;

-- ─────────────────────────────────────────────
-- EXTEND EVENTS TABLE
-- ─────────────────────────────────────────────
alter table public.events
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'scheduled', 'published', 'archived', 'cancelled')),
  add column if not exists published_at timestamptz,
  add column if not exists expires_at timestamptz,
  add column if not exists display_order integer not null default 0,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists price numeric(10,2),
  add column if not exists currency text default 'INR',
  add column if not exists capacity integer,
  add column if not exists meeting_url text,
  add column if not exists address text,
  add column if not exists map_url text,
  add column if not exists facilitator_name text,
  add column if not exists facilitator_bio text,
  add column if not exists registration_open boolean not null default true,
  add column if not exists archived_at timestamptz;

-- Update existing published events to have published_at
update public.events
set published_at = created_at, status = 'published'
where is_published = true and published_at is null;

update public.events
set status = 'draft'
where is_published = false and status = 'published';

-- Admin policy on events
create policy "Admins can manage all events"
  on public.events for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- EXTEND RESOURCES TABLE
-- ─────────────────────────────────────────────
alter table public.resources
  add column if not exists status text not null default 'published'
    check (status in ('draft', 'scheduled', 'published', 'archived')),
  add column if not exists display_order integer not null default 0,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists archived_at timestamptz,
  add column if not exists tags text[] default '{}',
  add column if not exists facilitator_name text,
  add column if not exists audience text not null default 'all'
    check (audience in ('all', 'selected', 'admin_only'));

create policy "Admins can manage all resources"
  on public.resources for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- EXTEND CLIENT SESSIONS TABLE
-- ─────────────────────────────────────────────
alter table public.client_sessions
  add column if not exists session_type text not null default 'coaching'
    check (session_type in ('1on1','group','coaching','meditation','breathwork','akashic','counselling','energy_healing','other')),
  add column if not exists meeting_url text,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists updated_by uuid references auth.users(id),
  add column if not exists archived_at timestamptz,
  add column if not exists recording_expires_at timestamptz;

create policy "Admins can manage all client sessions"
  on public.client_sessions for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage all session participants"
  on public.session_participants for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────────
create table if not exists public.announcements (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  short_message   text not null,
  full_content    text,
  type            text not null default 'general'
    check (type in ('general','event_reminder','retreat','new_session','new_recording','schedule_change','important_notice')),
  priority        text not null default 'normal'
    check (priority in ('normal','important','urgent')),
  cover_image_url text,
  cta_label       text,
  cta_url         text,
  status          text not null default 'draft'
    check (status in ('draft','scheduled','published','archived')),
  is_featured     boolean not null default false,
  is_dismissible  boolean not null default true,
  audience        text not null default 'all'
    check (audience in ('all','selected','event_registered','session_assigned')),
  target_event_id uuid references public.events(id) on delete set null,
  published_at    timestamptz,
  expires_at      timestamptz,
  display_order   integer not null default 0,
  created_by      uuid references auth.users(id),
  updated_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_announcements_status on public.announcements (status);
create index if not exists idx_announcements_published_at on public.announcements (published_at);
create index if not exists idx_announcements_expires_at on public.announcements (expires_at);
create index if not exists idx_announcements_is_featured on public.announcements (is_featured);

alter table public.announcements enable row level security;

create policy "Clients can read published announcements"
  on public.announcements for select
  to authenticated
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
    and (expires_at is null or expires_at > now())
  );

create policy "Admins can manage all announcements"
  on public.announcements for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- ANNOUNCEMENT READS
-- ─────────────────────────────────────────────
create table if not exists public.announcement_reads (
  announcement_id uuid not null references public.announcements(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  read_at         timestamptz,
  dismissed_at    timestamptz,
  created_at      timestamptz not null default now(),
  primary key (announcement_id, user_id)
);

create index if not exists idx_announcement_reads_user_id on public.announcement_reads (user_id);

alter table public.announcement_reads enable row level security;

create policy "Users can manage own announcement reads"
  on public.announcement_reads for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Admins can read all announcement reads"
  on public.announcement_reads for select
  using (public.is_admin());

-- ─────────────────────────────────────────────
-- MEDIA ASSETS
-- ─────────────────────────────────────────────
create table if not exists public.media_assets (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  media_type      text not null
    check (media_type in ('image','video','audio','pdf','external_video','external_audio')),
  provider        text,
  storage_bucket  text,
  storage_path    text,
  external_url    text,
  public_url      text,
  thumbnail_url   text,
  mime_type       text,
  file_size       bigint,
  duration_seconds integer,
  visibility      text not null default 'public'
    check (visibility in ('public','authenticated','private')),
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  archived_at     timestamptz
);

create index if not exists idx_media_assets_media_type on public.media_assets (media_type);
create index if not exists idx_media_assets_visibility on public.media_assets (visibility);
create index if not exists idx_media_assets_archived_at on public.media_assets (archived_at);

alter table public.media_assets enable row level security;

create policy "Public media is readable by all authenticated users"
  on public.media_assets for select
  to authenticated
  using (visibility = 'public' and archived_at is null);

create policy "Authenticated media is readable by authenticated users"
  on public.media_assets for select
  to authenticated
  using (visibility in ('public','authenticated') and archived_at is null);

create policy "Admins can manage all media assets"
  on public.media_assets for all
  using (public.is_admin())
  with check (public.is_admin());

-- ─────────────────────────────────────────────
-- ADMIN ACTIVITY LOG
-- ─────────────────────────────────────────────
create table if not exists public.admin_activity_log (
  id              uuid primary key default uuid_generate_v4(),
  admin_user_id   uuid not null references auth.users(id),
  action          text not null,
  entity_type     text not null,
  entity_id       uuid,
  summary         text not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_admin_log_admin_user_id on public.admin_activity_log (admin_user_id);
create index if not exists idx_admin_log_created_at on public.admin_activity_log (created_at desc);
create index if not exists idx_admin_log_entity_type on public.admin_activity_log (entity_type);

alter table public.admin_activity_log enable row level security;

create policy "Admins can read activity log"
  on public.admin_activity_log for select
  using (public.is_admin());

create policy "Admins can insert activity log"
  on public.admin_activity_log for insert
  with check (public.is_admin() and auth.uid() = admin_user_id);

-- ─────────────────────────────────────────────
-- GRANT ADMIN ROLE (run separately after creating admin user)
-- ─────────────────────────────────────────────
-- To grant admin access to a user, run in SQL Editor:
-- insert into public.user_roles (user_id, role)
-- values ('REPLACE_WITH_USER_UUID', 'admin');
