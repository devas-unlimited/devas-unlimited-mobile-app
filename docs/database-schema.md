# Database Schema — Devas Unlimited

## Tables

### `profiles`
Extends `auth.users`. Auto-created via trigger on signup.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | References auth.users |
| full_name | text | |
| avatar_url | text | |
| role | text | 'client' or 'admin' |
| created_at | timestamptz | |
| updated_at | timestamptz | |

### `events`
Published events and announcements.
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| title | text | |
| slug | text UNIQUE | |
| category | text | Music, Live, Retreat, Session, News |
| format | text | Event, Live, Retreat, Workshop |
| description | text | |
| city | text | |
| venue | text | |
| starts_at | timestamptz | |
| ends_at | timestamptz | |
| registration_url | text | External link |
| cover_image_url | text | |
| is_featured | bool | Dashboard hero card |
| is_published | bool | Visibility gate |

### `event_participants`
User registrations and attendance.

### `client_sessions`
1:1 and group sessions. Only accessible to participants via RLS.
| Column | Type | Notes |
|--------|------|-------|
| recording_status | text | none / processing / available / expired |
| recording_url | text | External URL (Vimeo etc.) — never uploaded to Supabase |
| is_private | bool | Always true for client sessions |

### `session_participants`
Links users to sessions. Contains reflection notes.
RLS: users can only read/update their own rows.

### `meditation_sessions`
Written by the client app after a completed meditation.
RLS: users can only read/insert their own rows.

### `resources`
Sanctuary content — metadata + external URL only.
| Column | Type | Notes |
|--------|------|-------|
| category | text | watch / listen / meditate |
| provider | text | youtube, vimeo, soundcloud, spotify, meditation |
| external_url | text | No media stored in Supabase |

### `journey_levels`
Static reference table — 7 levels, readable by all authenticated users.

## RLS Summary

| Table | Anon | Authenticated | Notes |
|-------|------|---------------|-------|
| profiles | ✗ | Own row only | |
| events | ✗ | Published only | |
| event_participants | ✗ | Own rows only | |
| client_sessions | ✗ | Participant only | Via session_participants join |
| session_participants | ✗ | Own rows only | |
| meditation_sessions | ✗ | Own rows only | Insert + select |
| resources | ✗ | Published only | |
| journey_levels | ✗ | All rows | Read-only |
