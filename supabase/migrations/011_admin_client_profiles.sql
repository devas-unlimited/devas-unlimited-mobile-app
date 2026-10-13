-- ─────────────────────────────────────────────
-- 011 — Admin Clients list shows every user
--
-- 1. Admins can read all profiles (previously only their own was visible)
-- 2. Profiles store the user's email, kept in sync with auth
-- 3. New sign-ups (email or Google) get a name, email and avatar automatically
-- 4. Any existing users missing a profile get one now
-- 5. profiles.role mirrors user_roles, and users can no longer edit it themselves
--
-- Safe to run more than once.
-- ─────────────────────────────────────────────

-- 1. Admin read access
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

-- 2. Email column
alter table public.profiles add column if not exists email text;
create index if not exists idx_profiles_email on public.profiles (lower(email));

-- 3. Profile creation on sign-up — Google sends `name`/`picture`, email sign-up sends `full_name`
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, email, role)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'full_name', ''), nullif(new.raw_user_meta_data->>'name', ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    new.email,
    'client'
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name),
        avatar_url = coalesce(public.profiles.avatar_url, excluded.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep email current if a user changes it
create or replace function public.handle_user_email_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles set email = new.email, updated_at = now() where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_email_changed on auth.users;
create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute procedure public.handle_user_email_change();

-- 4. Backfill: create missing profiles, fill in emails / names for existing ones
insert into public.profiles (id, full_name, avatar_url, email, role)
select
  u.id,
  coalesce(nullif(u.raw_user_meta_data->>'full_name', ''), nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1)),
  coalesce(u.raw_user_meta_data->>'avatar_url', u.raw_user_meta_data->>'picture'),
  u.email,
  'client'
from auth.users u
on conflict (id) do nothing;

update public.profiles p
set email = u.email,
    full_name = coalesce(nullif(p.full_name, ''), nullif(u.raw_user_meta_data->>'full_name', ''), nullif(u.raw_user_meta_data->>'name', ''), split_part(u.email, '@', 1))
from auth.users u
where u.id = p.id
  and (p.email is distinct from u.email or p.full_name is null or p.full_name = '');

-- 5. Role label mirrors the real permissions table
update public.profiles p
set role = case when exists (
  select 1 from public.user_roles r where r.user_id = p.id and r.role in ('admin', 'super_admin')
) then 'admin' else 'client' end;

create or replace function public.sync_profile_role()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  target uuid := coalesce(new.user_id, old.user_id);
begin
  update public.profiles
  set role = case when exists (
    select 1 from public.user_roles where user_id = target and role in ('admin', 'super_admin')
  ) then 'admin' else 'client' end
  where id = target;
  return null;
end;
$$;

drop trigger if exists on_user_roles_changed on public.user_roles;
create trigger on_user_roles_changed
  after insert or update or delete on public.user_roles
  for each row execute procedure public.sync_profile_role();

-- Users may edit only their name / avatar — not their role or email
revoke update on public.profiles from authenticated, anon;
grant update (full_name, avatar_url, updated_at) on public.profiles to authenticated;
