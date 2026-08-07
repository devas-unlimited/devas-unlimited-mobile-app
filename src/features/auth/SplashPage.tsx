import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { DevasSymbol } from '@/components/ui/DevasSymbol'

export function SplashPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading) {
      if (session) {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [session, loading, navigate])

  const handleBegin = () => {
    if (session) {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] overflow-hidden px-8">
      <OrgBlobs variant="splash" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xs mx-auto">
        {/* Symbol */}
        <div className="mb-8">
          <DevasSymbol size={96} color="#7C2447" />
        </div>

        {/* Wordmark */}
        <div className="mb-2">
          <h1 className="text-[28px] font-bold tracking-[0.2em] text-[#321B26] uppercase leading-tight">
            Devas
          </h1>
          <p className="text-[11px] font-semibold tracking-[0.35em] text-[#7C2447] uppercase">
            Unlimited
          </p>
        </div>

        {/* Tagline */}
        <p className="mt-6 mb-12 text-[#8C7B85] text-sm font-medium tracking-wide">
          Awaken. Align. Elevate.
        </p>

        {/* CTA */}
        <button
          onClick={handleBegin}
          className="w-full py-4 px-8 bg-[#7C2447] text-white rounded-full text-base font-semibold tracking-wide shadow-lg active:scale-[0.98] transition-transform duration-150"
        >
          {loading ? 'Loading…' : 'Begin your journey'}
        </button>

        {/* Supporting text */}
        <p className="mt-4 text-[#8C7B85] text-xs leading-relaxed">
          A calmer space for sessions, practice &amp; growth
        </p>
      </div>
    </div>
  )
}
