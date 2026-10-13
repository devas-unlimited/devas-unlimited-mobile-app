import type { ReactNode } from 'react'
import { BottomNav } from '@/components/navigation/BottomNav'

interface AppShellProps {
  children: ReactNode
  hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
  return (
    <div className="flex flex-col min-h-screen bg-[#FCF7F0] w-full max-w-lg mx-auto relative overflow-x-clip">
      {/* Subtle surrounding background for desktop */}
      <div
        className="fixed inset-0 -z-10 hidden sm:block"
        style={{ background: 'linear-gradient(135deg, #F0E6F6 0%, #FCF7F0 50%, #E8F4ED 100%)' }}
      />
      <main
        className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden scrollbar-none"
        style={{
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: hideNav ? 'env(safe-area-inset-bottom, 0px)' : 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
