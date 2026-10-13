-- ============================================================
-- Devas Unlimited — Remove Reflection Notes (003)
-- ============================================================
-- Reflection notes (personal_reflection_note, practice_suggestion)
-- are no longer used in the client-facing session details page
-- or the admin session form. Dropping these columns and the
-- now-unused update RLS policy cleans up session_participants.
-- ============================================================

-- Drop reflection note columns
alter table public.session_participants
  drop column if exists personal_reflection_note,
  drop column if exists practice_suggestion;

-- Drop the RLS policy that only existed to allow clients to
-- write their own reflection notes — no longer needed.
drop policy if exists "Users can update own reflection notes" on public.session_participants;
