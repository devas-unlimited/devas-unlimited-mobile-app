# Deployment Guide — Devas Unlimited

## 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Choose a region close to your users
3. Set a strong database password (save it)
4. Wait for project to provision (~2 min)

## 2. Run Migrations

In the Supabase SQL Editor (Dashboard → SQL Editor):

```sql
-- Paste the contents of supabase/migrations/001_initial_schema.sql
-- and run it
```

## 3. Run Seed Data

```sql
-- Paste supabase/seed.sql and run it
-- This inserts journey levels, events, and sanctuary resources
```

## 4. Create the Seed User (Madhavika)

1. Go to Authentication → Users → Invite User
2. Email: `madhavika@devasunlimited.com`
3. Copy the generated UUID
4. In `supabase/seed.sql`, find the commented `do $$ ... $$` block
5. Replace `REPLACE_WITH_USER_UUID` with the actual UUID
6. Run that block to insert sample sessions, events, and meditation history

## 5. Get Environment Variables

Dashboard → Settings → API:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon / public key** → `VITE_SUPABASE_PUBLISHABLE_KEY`

Never use the `service_role` key in browser code.

## 6. Enable Google OAuth (optional)

1. Dashboard → Authentication → Providers → Google → Enable
2. Create OAuth credentials at [console.cloud.google.com](https://console.cloud.google.com)
3. Add Authorized redirect URIs:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
4. Add Client ID and Secret in Supabase Google provider settings
5. Add site URLs in Dashboard → Authentication → URL Configuration:
   - **Site URL**: `https://your-deployed-domain.netlify.app`
   - **Redirect URLs**: `https://your-deployed-domain.netlify.app/auth/callback`

For local development, add `http://localhost:5173/auth/callback` to Redirect URLs.

## 7. Deploy to Netlify

```bash
# Option A: via CLI
npm install -g netlify-cli
netlify login
netlify init
# Set build command: npm run build
# Set publish dir: dist

# Option B: via GitHub
# Push repo to GitHub → connect in Netlify dashboard
```

Set environment variables in Netlify → Site Settings → Environment Variables:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

The `netlify.toml` is already configured for SPA routing.

## 8. Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel project settings. The `vercel.json` handles SPA rewrites.

## 9. Post-Deployment Verification

- [ ] Visit root URL — splash screen loads
- [ ] Login with email/password works
- [ ] Google OAuth redirects correctly
- [ ] Dashboard loads with live data
- [ ] Meditation timer saves to DB
- [ ] PWA install prompt appears (on mobile)
- [ ] All routes work on direct URL navigation

## 10. Updating the Application

```bash
git push origin main
# Netlify/Vercel auto-deploys from main branch
```

For database changes:
1. Create a new migration file: `supabase/migrations/002_your_change.sql`
2. Run it in Supabase SQL Editor
