import type { ReactNode } from 'react'
import { useAdminAuth } from '@/features/admin/hooks/useAdminAuth'

interface AdminRouteProps {
  children: ReactNode
}

export function AdminRoute({ children }: AdminRouteProps) {
  const state = useAdminAuth()

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FCF7F0]">
        <div className="w-10 h-10 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
      </div>
    )
  }

  if (state === 'unauthorized') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] px-8 text-center">
        <div className="w-16 h-16 rounded-full bg-[#E8DDF2] flex items-center justify-center mb-4 text-2xl">🔒</div>
        <h1 className="text-xl font-bold text-[#321B26] mb-2">Access Denied</h1>
        <p className="text-[#8C7B85] text-sm max-w-xs">
          You don't have permission to access the admin dashboard. Please contact your administrator.
        </p>
      </div>
    )
  }

  if (state === 'unauthenticated') {
    return null
  }

  return <>{children}</>
}
