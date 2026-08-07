-- ============================================================
-- Devas Unlimited — Initial Schema Migration
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'client' check (role in ('client', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'client'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────────
create table if not exists public.events (
  id                  uuid primary key default uuid_generate_v4(),
  title               text not null,
  slug                text not null unique,
  category            text not null,
  format              text not null,
  description         text,
  city                text,
  venue               text,
  starts_at           timestamptz not null,
  ends_at             timestamptz,
  registration_url    text,
  cover_image_url     text,
  is_featured         boolean not null default false,
  is_published        boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_events_starts_at on public.events (starts_at);
create index if not exists idx_events_is_featured on public.events (is_featured);
create index if not exists idx_events_is_published on public.events (is_published);
create index if not exists idx_events_category on public.events (category);

alter table public.events enable row level security;

create policy "Authenticated users can read published events"
  on public.events for select
  to authenticated
  using (is_published = true);

-- ─────────────────────────────────────────────
-- EVENT PARTICIPANTS
-- ─────────────────────────────────────────────
create table if not exists public.event_participants (
  id                    uuid primary key default uuid_generate_v4(),
  event_id              uuid not null references public.events(id) on delete cascade,
  user_id               uuid not null references auth.users(id) on delete cascade,
  registration_status   text not null default 'registered',
  attendance_status     text,
  attended_at           timestamptz,
  created_at            timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists idx_event_participants_user_id on public.event_participants (user_id);
create index if not exists idx_event_participants_event_id on public.event_participants (event_id);

alter table public.event_participants enable row level security;

create policy "Users can read own event participation"
  on public.event_participants for select
  using (auth.uid() = user_id);

create policy "Users can insert own event participation"
  on public.event_participants for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- CLIENT SESSIONS
-- ─────────────────────────────────────────────
create table if not exists public.client_sessions (
  id                          uuid primary key default uuid_generate_v4(),
  title                       text not null,
  session_kind                text not null check (session_kind in ('1on1', 'group')),
  coach_name                  text,
  starts_at                   timestamptz not null,
  duration_minutes            integer,
  status                      text not null default 'completed' check (status in ('scheduled', 'completed', 'cancelled')),
  recording_provider          text,
  recording_url               text,
  recording_duration_seconds  integer,
  recording_status            text not null default 'none' check (recording_status in ('none', 'processing', 'available', 'expired')),
  is_private                  boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_client_sessions_starts_at on public.client_sessions (starts_at);
create index if not exists idx_client_sessions_status on public.client_sessions (status);

alter table public.client_sessions enable row level security;

-- NOTE: The SELECT policy for client_sessions is defined below,
-- after session_participants is created (it references that table).

-- ─────────────────────────────────────────────
-- SESSION PARTICIPANTS
-- ─────────────────────────────────────────────
create table if not exists public.session_participants (
  session_id                uuid not null references public.client_sessions(id) on delete cascade,
  user_id                   uuid not null references auth.users(id) on delete cascade,
  attendance_status         text not null default 'attended',
  personal_reflection_note  text,
  practice_suggestion       text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now(),
  primary key (session_id, user_id)
);

create index if not exists idx_session_participants_user_id on public.session_participants (user_id);
create index if not exists idx_session_participants_session_id on public.session_participants (session_id);

alter table public.session_participants enable row level security;

create policy "Users can read own session participation"
  on public.session_participants for select
  using (auth.uid() = user_id);

create policy "Users can update own reflection notes"
  on public.session_participants for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Defined here (after session_participants) to avoid forward reference
create policy "Users can read sessions they participate in"
  on public.client_sessions for select
  using (
    exists (
      select 1 from public.session_participants sp
      where sp.session_id = client_sessions.id
        and sp.user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- MEDITATION SESSIONS
-- ─────────────────────────────────────────────
create table if not exists public.meditation_sessions (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  started_at      timestamptz not null,
  completed_at    timestamptz,
  duration_seconds integer not null,
  intention       text,
  status          text not null default 'completed' check (status in ('active', 'completed', 'cancelled')),
  created_at      timestamptz not null default now()
);

create index if not exists idx_meditation_user_id on public.meditation_sessions (user_id);
create index if not exists idx_meditation_completed_at on public.meditation_sessions (completed_at);
create index if not exists idx_meditation_status on public.meditation_sessions (status);

alter table public.meditation_sessions enable row level security;

create policy "Users can read own meditation sessions"
  on public.meditation_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own meditation sessions"
  on public.meditation_sessions for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- RESOURCES (SANCTUARY)
-- ─────────────────────────────────────────────
create table if not exists public.resources (
  id              uuid primary key default uuid_generate_v4(),
  title           text not null,
  category        text not null check (category in ('watch', 'listen', 'meditate')),
  provider        text not null,
  external_url    text not null,
  thumbnail_url   text,
  duration_minutes integer,
  description     text,
  is_featured     boolean not null default false,
  is_published    boolean not null default true,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_resources_is_published on public.resources (is_published);
create index if not exists idx_resources_is_featured on public.resources (is_featured);
create index if not exists idx_resources_category on public.resources (category);

alter table public.resources enable row level security;

create policy "Authenticated users can read published resources"
  on public.resources for select
  to authenticated
  using (is_published = true);

-- ─────────────────────────────────────────────
-- JOURNEY LEVELS
-- ─────────────────────────────────────────────
create table if not exists public.journey_levels (
  level                     integer primary key,
  name                      text not null,
  description               text,
  required_sessions         integer not null default 0,
  required_events           integer not null default 0,
  required_meditation_days  integer not null default 0,
  required_retreats         integer not null default 0
);

alter table public.journey_levels enable row level security;

create policy "Authenticated users can read journey levels"
  on public.journey_levels for select
  to authenticated
  using (true);
