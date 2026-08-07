# Devas Unlimited — Implementation Plan

## Tech Stack
- **React 19** + **TypeScript 6** (strict)
- **Vite 8** + **@tailwindcss/vite** (Tailwind v4)
- **React Router v7**
- **TanStack Query v5**
- **Supabase JS v2** (auth + PostgreSQL)
- **React Hook Form v7** + **Zod v3**
- **Lucide React** (icons)
- **date-fns v4**
- **vite-plugin-pwa v1**
- **Vitest v4** + **Playwright v1**

## Design System (from wireframes)
- **Viewport**: 390 × 844 (primary), 320px minimum
- **Palette**: Ivory `#FCF7F0`, Burgundy `#7C2447`, Deep `#321B26`, Peach `#F9E2D8`, Sage `#DDE9D3`, Lavender `#E8DDF2`, Blue `#DDEDF1`, Gold `#E6B74B`
- **Font**: Manrope (300–800)
- **Radii**: 20–24px cards, pill buttons
- **Shadows**: warm subtle, `rgba(50,27,38,…)`
- **Motion**: 150–200ms ease

## Architecture Decisions
1. **No baseUrl in TS6** — path aliases via `paths` only (bundler moduleResolution)
2. **vitest.config.ts** separate from vite.config.ts
3. **Supabase type casts** — explicit where inference returns `never` due to placeholder URL
4. **Timer persistence** — sessionStorage timestamps for background-safe countdown
5. **Recordings** — URL + metadata only, no file uploads to Supabase Storage
6. **Media** — external providers (YouTube/Vimeo/SoundCloud), thumbnails only in DB

## Project Structure
```
src/
  features/
    auth/         — Splash, Login, SignUp, ForgotPassword, AuthCallback, AuthContext
    dashboard/    — DashboardPage, ProfileMenu
    events/       — EventsPage
    sessions/     — SessionsPage, SessionDetailPage
    meditation/   — MeditationPage, MeditationInsightsPage
    journey/      — JourneyPage, JourneyLevelsPopup
    sanctuary/    — SanctuaryPage
  components/
    layout/       — AppShell, ProtectedRoute
    navigation/   — BottomNav
    ui/           — Skeleton, DevasSymbol, OrgBlobs
    feedback/     — ErrorBoundary, Toast
  hooks/          — useMeditationTimer
  services/       — dashboard, events, sessions, meditation, journey, sanctuary
  lib/            — supabase, queryClient, utils
  types/          — database.ts
  test/           — setup.ts, meditation.test.ts
supabase/
  migrations/001_initial_schema.sql
  seed.sql
docs/
artifacts/screenshots/
```
