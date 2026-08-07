import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, LogOut, User, ExternalLink, ChevronRight } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'

interface Props {
  onMenuClick: () => void
}

const BREADCRUMB_LABELS: Record<string, string> = {
  overview: 'Overview',
  events: 'Events & Retreats',
  announcements: 'Announcements',
  sessions: 'Client Sessions',
  resources: 'Sanctuary Resources',
  clients: 'Clients',
  settings: 'Settings',
  new: 'New',
}

function useBreadcrumbs() {
  const { pathname } = useLocation()
  const segments = pathname.split('/').filter(Boolean).slice(1) // remove 'admin'
  return segments.map(s => ({
    label: BREADCRUMB_LABELS[s] ?? (s.length === 36 ? 'Detail' : s),
    segment: s,
  }))
}

export function AdminHeader({ onMenuClick }: Props) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const breadcrumbs = useBreadcrumbs()

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleSignOut = async () => {
    setMenuOpen(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.full_name ?? user?.email?.split('@')[0] ?? 'Admin'
  const initials = displayName[0]?.toUpperCase() ?? 'A'

  return (
    <header className="h-14 bg-white border-b border-[#F0E6EC] flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors"
        aria-label="Open navigation"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex-1 flex items-center gap-1.5 overflow-hidden">
        <span className="text-xs text-[#C4B5BD] hidden sm:block">Admin</span>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.segment} className="flex items-center gap-1.5">
            <ChevronRight size={12} className="text-[#C4B5BD] hidden sm:block" />
            <span className={`text-xs font-medium truncate ${i === breadcrumbs.length - 1 ? 'text-[#321B26]' : 'text-[#8C7B85]'}`}>
              {crumb.label}
            </span>
          </span>
        ))}
      </nav>

      {/* View client app link */}
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex items-center gap-1.5 text-xs text-[#8C7B85] hover:text-[#7C2447] transition-colors"
      >
        <ExternalLink size={13} />
        View app
      </a>

      {/* Profile menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-8 h-8 rounded-full bg-[#7C2447] text-white flex items-center justify-center text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#7C2447]/40"
          aria-label="Admin profile menu"
          aria-expanded={menuOpen}
        >
          {initials}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl shadow-[0_8px_32px_rgba(50,27,38,0.15)] border border-[#F0E6EC] py-2 z-50">
            <div className="px-4 py-3 border-b border-[#F0E6EC]">
              <p className="text-sm font-semibold text-[#321B26] truncate">{displayName}</p>
              <p className="text-xs text-[#8C7B85] truncate">{user?.email}</p>
            </div>
            <button
              onClick={() => { setMenuOpen(false); navigate('/profile') }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#4A3540] hover:bg-[#FCF7F0] transition-colors"
            >
              <User size={15} className="text-[#8C7B85]" />
              My account
            </button>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#7C2447] hover:bg-[#FCF7F0] transition-colors"
            >
              <LogOut size={15} />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
