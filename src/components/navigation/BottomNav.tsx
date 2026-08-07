import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Timer, Calendar, TrendingUp, Sparkles } from 'lucide-react'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home', shortLabel: 'Home' },
  { to: '/sessions', icon: BookOpen, label: 'Sessions', shortLabel: 'Sessions' },
  { to: '/meditate', icon: Timer, label: 'Meditate', shortLabel: 'Meditate' },
  { to: '/events', icon: Calendar, label: 'Events', shortLabel: 'Events' },
  { to: '/journey', icon: TrendingUp, label: 'Journey', shortLabel: 'Journey' },
  { to: '/sanctuary', icon: Sparkles, label: 'Sanctuary', shortLabel: 'Sanctuary' },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-sm border-t border-[#F7F0E9]"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        boxShadow: '0 -2px 16px rgba(50, 27, 38, 0.06)',
      }}
    >
      <div className="flex items-stretch max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label, shortLabel }) => (
          <NavLink
            key={to}
            to={to}
            aria-label={label}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-2 gap-0.5 min-h-[56px] transition-colors duration-150 ${
                isActive
                  ? 'text-[#7C2447]'
                  : 'text-[#8C7B85] hover:text-[#7C2447]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`p-1 rounded-xl transition-all duration-150 ${
                    isActive ? 'bg-[#F9E2D8]' : ''
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    aria-hidden="true"
                  />
                </div>
                <span
                  className={`text-[9px] leading-tight font-medium tracking-wide transition-all duration-150 ${
                    isActive ? 'opacity-100' : 'opacity-60'
                  }`}
                >
                  {shortLabel}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
