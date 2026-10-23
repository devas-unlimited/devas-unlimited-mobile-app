import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Flame, HeartPulse, CalendarDays, Sparkles } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { OrgBlobs } from '@/components/ui/OrgBlobs'

const FEATURES = [
  { icon: Flame, label: 'Guided meditation & daily practice' },
  { icon: HeartPulse, label: 'Sanctuary — curated audio & video teachings' },
  { icon: CalendarDays, label: 'Events, retreats & announcements' },
  { icon: Sparkles, label: 'Personal journey & progress tracking' },
]

export function SplashPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && session) {
      navigate('/dashboard', { replace: true })
    }
  }, [session, loading, navigate])

  // Signed-in users only see the brand briefly on launch, then go straight in
  if (loading || session) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] overflow-hidden px-8">
        <OrgBlobs variant="splash" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <img src="/brand/devas-logo.png" alt="Devas Unlimited" className="w-56 mb-10" />
          <div
            className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin"
            aria-label="Opening your space"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#FCF7F0] overflow-hidden">
      <OrgBlobs variant="splash" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-lg flex-col px-8 py-10">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <img src="/brand/devas-logo.png" alt="Devas Unlimited" className="w-52 mb-6" />
          <p className="text-[#8C7B85] text-sm font-medium tracking-wide">
            Awaken. Align. Elevate.
          </p>
          <h1 className="mt-4 text-2xl font-bold text-[#3d2b33] leading-snug">
            A calmer space for sessions, practice &amp; growth
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[#3d2b33]/70">
            Devas Unlimited is a meditation and conscious-living companion. Practice guided
            meditations, explore curated audio and video teachings in the Sanctuary, join
            events and retreats, and follow your personal journey — all in one place.
          </p>
        </div>

        {/* What the app offers — shown publicly so visitors understand the app */}
        <ul className="mt-8 space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex items-center gap-3 rounded-2xl bg-white/80 px-4 py-3 shadow-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#7C2447]/10 text-[#7C2447]">
                <Icon size={18} />
              </span>
              <span className="text-sm font-medium text-[#3d2b33]">{label}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="mt-auto pt-10">
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 px-8 bg-[#7C2447] text-white rounded-full text-base font-semibold tracking-wide shadow-lg active:scale-[0.98] transition-transform duration-150"
          >
            Begin your journey
          </button>
          <p className="mt-4 text-center text-[#8C7B85] text-xs">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#7C2447] underline">
              Sign in
            </Link>
          </p>

          <footer className="mt-8 flex items-center justify-center gap-4 text-xs text-[#8C7B85]">
            <Link to="/privacy" className="hover:text-[#7C2447] hover:underline">
              Privacy Policy
            </Link>
            <span aria-hidden>·</span>
            <Link to="/terms" className="hover:text-[#7C2447] hover:underline">
              Terms of Service
            </Link>
          </footer>
        </div>
      </div>
    </div>
  )
}
