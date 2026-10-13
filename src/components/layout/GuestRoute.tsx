import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/features/auth/AuthContext'

/** Login/sign-up screens: anyone already signed in goes straight into the app */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/dashboard'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCF7F0]">
        <div className="w-10 h-10 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (session) return <Navigate to={from} replace />

  return <>{children}</>
}
