# Admin Dashboard — Implementation Plan

## Architecture decisions

- Admin UI lives inside the same Vite/React SPA under `/admin/*` routes
- Separate lazy-loaded chunk — zero impact on client bundle
- Auth guard: DB-backed `user_roles` table, never `user_metadata`
- RLS helper function `is_admin()` used by every admin policy
- No service-role key in browser — anon key only, RLS does the enforcement
- Reuses existing: Supabase client, TanStack Query, design tokens, Toast, ErrorBoundary

## New database tables (migration 002)

| Table | Purpose |
|-------|---------|
| `user_roles` | Secure role store — admin / super_admin |
| `announcements` | Dashboard announcements with scheduling |
| `announcement_reads` | Per-user read/dismissed tracking |
| `media_assets` | Metadata for all uploaded or linked media |
| `admin_activity_log` | Immutable audit trail |

## Extended columns (existing tables)

| Table | Added columns |
|-------|--------------|
| `events` | `status`, `published_at`, `expires_at`, `display_order`, `created_by` |
| `resources` | `status`, `display_order`, `created_by`, `archived_at` |
| `client_sessions` | `meeting_url`, `created_by`, `session_type` |

## Admin routes

```
/admin                          → redirect to /admin/overview
/admin/overview                 → Overview dashboard
/admin/events                   → Events list
/admin/events/new               → Create event
/admin/events/:id               → Edit event
/admin/announcements            → Announcements list
/admin/announcements/new        → Create announcement
/admin/announcements/:id        → Edit announcement
/admin/sessions                 → Sessions list
/admin/sessions/new             → Create session
/admin/sessions/:id             → Edit session
/admin/resources                → Sanctuary resources list
/admin/resources/new            → Create resource
/admin/resources/:id            → Edit resource
/admin/clients                  → Clients list
/admin/clients/:id              → Client detail
/admin/settings                 → Settings
```

## Security model

```sql
-- Core admin check (used in all admin RLS policies)
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
    and role in ('admin', 'super_admin')
  )
$$;
```

No frontend role check alone is ever the security gate. Every admin write goes through RLS that calls `is_admin()`.

## Client synchronization strategy

- TanStack Query `staleTime: 0` on admin queries (always fresh)
- Client queries use `staleTime: 5min` with `refetchOnWindowFocus: true`
- Supabase Realtime channel on `events`, `announcements`, `resources` for client screens
- After any admin mutation → `queryClient.invalidateQueries()` matching client query keys
- No new deployment needed for content changes

## File structure

```
src/features/admin/
  layout/
    AdminShell.tsx       — sidebar + header wrapper
    AdminSidebar.tsx     — nav items + collapse
    AdminHeader.tsx      — breadcrumb + profile
  pages/
    AdminOverviewPage.tsx
    AdminEventsPage.tsx
    AdminEventFormPage.tsx
    AdminAnnouncementsPage.tsx
    AdminAnnouncementFormPage.tsx
    AdminSessionsPage.tsx
    AdminSessionFormPage.tsx
    AdminResourcesPage.tsx
    AdminResourceFormPage.tsx
    AdminClientsPage.tsx
    AdminClientDetailPage.tsx
  components/
    StatCard.tsx
    AdminTable.tsx
    StatusBadge.tsx
    ConfirmDialog.tsx
    AdminFormField.tsx
  hooks/
    useAdminAuth.ts      — role check + redirect
src/components/layout/AdminRoute.tsx   — route guard
```
