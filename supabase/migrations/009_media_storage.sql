-- ============================================================
-- Devas Unlimited — Media storage for admin image uploads (009)
-- ============================================================
-- Public "media" bucket: anyone can view images (they appear in the
-- app), only admins can upload, replace or delete them.
-- Images up to 5 MB: JPG, PNG, WebP, GIF.
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Devas media: public read"    on storage.objects;
drop policy if exists "Devas media: admin upload"   on storage.objects;
drop policy if exists "Devas media: admin update"   on storage.objects;
drop policy if exists "Devas media: admin delete"   on storage.objects;

create policy "Devas media: public read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "Devas media: admin upload"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

create policy "Devas media: admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

create policy "Devas media: admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());
