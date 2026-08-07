# Screen Checklist

| # | Screen | File | Status | Notes |
|---|--------|------|--------|-------|
| 01 | Splash | `src/features/auth/SplashPage.tsx` | ✅ Complete | Auth-aware redirect |
| 02 | Login | `src/features/auth/LoginPage.tsx` | ✅ Complete | Email/pass + Google OAuth |
| 02b | Sign Up | `src/features/auth/SignUpPage.tsx` | ✅ Complete | Not in PDFs but required |
| 02c | Forgot Password | `src/features/auth/ForgotPasswordPage.tsx` | ✅ Complete | Not in PDFs but required |
| 02d | Auth Callback | `src/features/auth/AuthCallback.tsx` | ✅ Complete | OAuth redirect handler |
| 03 | Dashboard | `src/features/dashboard/DashboardPage.tsx` | ✅ Complete | Live stats, featured event, quick actions |
| 04 | Events & Announcements | `src/features/events/EventsPage.tsx` | ✅ Complete | Filter pills, cards, external links |
| 05 | Previous Sessions | `src/features/sessions/SessionsPage.tsx` | ✅ Complete | RLS-protected, filters, badges |
| 06 | Session Details | `src/features/sessions/SessionDetailPage.tsx` | ✅ Complete | Recording states, reflection notes |
| 07 | Meditation Timer | `src/features/meditation/MeditationPage.tsx` | ✅ Complete | Timestamp-based, pause/resume, saves to DB |
| 08 | Meditation Insights | `src/features/meditation/MeditationInsightsPage.tsx` | ✅ Complete | SVG bar chart, streak, history |
| 09 | My Journey | `src/features/journey/JourneyPage.tsx` | ✅ Complete | Computed level, timeline |
| 09b | Journey Levels Popup | `src/features/journey/JourneyLevelsPopup.tsx` | ✅ Complete | Bottom sheet, focus trap, a11y |
| 10 | Devas Sanctuary | `src/features/sanctuary/SanctuaryPage.tsx` | ✅ Complete | Category filters, featured card, external links |

## Global Components
- ✅ AppShell (safe-area, scroll, bottom nav)
- ✅ BottomNav (6 destinations, active state)
- ✅ ProfileMenu (sign out, version)
- ✅ ErrorBoundary
- ✅ Toast notifications
- ✅ OrgBlobs (decorative background)
- ✅ Skeleton loading states
- ✅ ProtectedRoute
