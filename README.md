# Devas Unlimited — Client App

> A calmer space for sessions, practice & growth.

Premium mobile-first PWA built with React 19, TypeScript, Tailwind CSS v4, and Supabase.

## Quick Start

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# 3. Run migrations in Supabase SQL Editor
# Paste: supabase/migrations/001_initial_schema.sql

# 4. Run seed data
# Paste: supabase/seed.sql

# 5. Start dev server
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:5173) |
| `npm run build` | TypeScript check + production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run Vitest unit tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run Playwright e2e tests |
| `npm run typecheck` | TypeScript type check only |

## Environment Variables

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-public-key
```

**Never commit `.env` or expose the `service_role` key.**

## Screens

1. Splash — auth-aware entry
2. Login / Sign Up / Forgot Password
3. Dashboard — live stats + featured event
4. Events & Announcements — filterable
5. Previous Sessions — RLS-protected
6. Session Details — recording states + reflection notes
7. Meditation Timer — timestamp-based, saves to DB
8. Meditation Insights — streaks + history
9. My Journey — computed level progress
10. Journey Levels Popup — focus-trapped bottom sheet
11. Devas Sanctuary — external media catalogue

## Deployment

See `docs/deployment.md` for full instructions.

**Netlify**: `netlify.toml` is pre-configured.  
**Vercel**: `vercel.json` is pre-configured.

## Documentation

- `docs/implementation-plan.md` — architecture decisions
- `docs/screen-checklist.md` — per-screen build status
- `docs/database-schema.md` — tables + RLS rules
- `docs/deployment.md` — step-by-step deploy guide
- `docs/ui-comparison.md` — wireframe vs implementation notes
