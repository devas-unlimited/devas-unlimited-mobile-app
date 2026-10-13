-- ============================================================
-- Devas Unlimited — Simplify event types (006)
-- ============================================================
-- The Events tab now has: All • Events • Retreats • Announcements
--   category: 'Event' | 'Retreat'
--   format:   'In-person' | 'Online' | 'Hybrid'
-- Existing rows are normalized, then constrained.
-- ============================================================

update public.events
set category = case when lower(category) = 'retreat' then 'Retreat' else 'Event' end;

update public.events
set format = case
  when lower(format) in ('online', 'live') then 'Online'
  when lower(format) = 'hybrid'            then 'Hybrid'
  else 'In-person'
end;

alter table public.events
  drop constraint if exists events_category_check,
  drop constraint if exists events_format_check;

alter table public.events
  add constraint events_category_check check (category in ('Event', 'Retreat')),
  add constraint events_format_check   check (format in ('In-person', 'Online', 'Hybrid'));
