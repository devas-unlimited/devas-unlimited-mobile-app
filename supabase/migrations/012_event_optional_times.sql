-- ─────────────────────────────────────────────
-- 012 — Events may be date-only (no fixed time)
--
-- all_day = true means the admin set a date but no time;
-- the app shows just the date instead of a clock time.
-- Safe to run more than once.
-- ─────────────────────────────────────────────

alter table public.events
  add column if not exists all_day boolean not null default false;
