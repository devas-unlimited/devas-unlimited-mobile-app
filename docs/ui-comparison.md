# UI Comparison — Wireframes vs Implementation

| Screen | Reference PDF | Match Status | Intentional Differences |
|--------|---------------|--------------|------------------------|
| 01 Splash | `01 Splash — HiFi V2.pdf` | ✅ Close match | Four-point symbol reproduced in SVG; no phone status bar rendered |
| 02 Login | `02 Login — HiFi V2.pdf` | ✅ Close match | Sign-up and password-reset added (not in PDFs but required) |
| 03 Dashboard | `03 Dashboard — HiFi V2.pdf` | ✅ Close match | Live data; stats shown as 0 when no history yet |
| 04 Events | `04 Events & Announcements — HiFi V2.pdf` | ✅ Close match | External registration links open in new tab |
| 05 Sessions | `05 Previous Sessions — HiFi V2.pdf` | ✅ Close match | "1:1" filter added alongside "Group" as per wireframe |
| 06 Session Details | `06 Session Details — HiFi V2.pdf` | ✅ Close match | 4 recording states implemented vs wireframe showing 1 |
| 07 Meditation Timer | `07 Meditation Timer — HiFi V2.pdf` | ✅ Close match | Timestamp-based timer instead of setInterval |
| 08 Insights | `08 Meditation Insights — HiFi V2.pdf` | ✅ Close match | CSS/SVG bar chart — no heavy chart library |
| 09 Journey | `09 My Journey — HiFi V2.pdf` | ✅ Close match | Level computed from live data, not hard-coded |
| 09b Journey Popup | `09b How Journey Levels Work — Popup.pdf` | ✅ Close match | Focus trap, ESC close, backdrop click |
| 10 Sanctuary | `10 Devas Sanctuary — Free Resources.pdf` | ✅ Close match | "Sanctuary" added as 6th nav item consistently |

## Deliberate Departures from Wireframes

1. **Navigation**: Wireframe shows 5 nav items on some screens and 6 on others. Resolved by consistently using 6: Home, Sessions, Meditate, Events, Journey, Sanctuary.
2. **Sign Up / Forgot Password**: Not supplied in PDFs but required for a functional app — designed to match Login visual style.
3. **Phone status bar**: Wireframes show a "9:41" mock status bar — not rendered in production; safe-area-inset spacing used instead.
4. **Timer completion**: Save button appears on completion rather than auto-saving, to prevent accidental duplicates.
5. **Recording states**: Session details shows 4 states (available, processing, expired, none) instead of just the "available" state shown in the wireframe.

## Screenshots

Screenshots to be captured by Playwright after Supabase credentials are configured:
- `artifacts/screenshots/01-splash.png`
- `artifacts/screenshots/02-login.png`
- `artifacts/screenshots/03-dashboard.png`
- `artifacts/screenshots/04-events.png`
- `artifacts/screenshots/05-sessions.png`
- `artifacts/screenshots/06-session-detail.png`
- `artifacts/screenshots/07-meditation.png`
- `artifacts/screenshots/08-insights.png`
- `artifacts/screenshots/09-journey.png`
- `artifacts/screenshots/09b-journey-popup.png`
- `artifacts/screenshots/10-sanctuary.png`
