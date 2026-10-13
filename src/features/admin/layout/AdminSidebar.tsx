import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Megaphone, Users,
  BookOpen, Settings, X, ChevronRight, Video, GalleryHorizontal,
} from 'lucide-react'

const NAV = [
  { to: '/admin/overview',       icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/banners',        icon: GalleryHorizontal, label: 'Home Banners' },
  { to: '/admin/events',         icon: Calendar,        label: 'Events & Retreats' },
  { to: '/admin/announcements',  icon: Megaphone,       label: 'Announcements' },
  { to: '/admin/sessions',       icon: Video,           label: 'Client Sessions' },
  { to: '/admin/resources',      icon: BookOpen,        label: 'Sanctuary' },
  { to: '/admin/clients',        icon: Users,           label: 'Clients' },
  { to: '/admin/settings',       icon: Settings,        label: 'Settings' },
]

interface Props {
  open: boolean
  onClose: () => void
}

export function AdminSidebar({ open, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-[#321B26]/40 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white z-50 flex flex-col
          shadow-[4px_0_32px_rgba(50,27,38,0.08)]
          transform transition-transform duration-200 ease-out
          lg:static lg:translate-x-0 lg:shadow-none lg:border-r lg:border-[#F0E6EC]
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Admin navigation"
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#F0E6EC]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7C2447] flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <div>
              <p className="text-xs font-bold text-[#321B26] leading-none">Devas</p>
              <p className="text-[10px] text-[#8C7B85] leading-none mt-0.5">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0]"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 mx-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 group
                ${isActive
                  ? 'bg-[#7C2447]/10 text-[#7C2447]'
                  : 'text-[#4A3540] hover:bg-[#FCF7F0] hover:text-[#321B26]'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={17} className={isActive ? 'text-[#7C2447]' : 'text-[#8C7B85] group-hover:text-[#7C2447]'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-[#7C2447]" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#F0E6EC]">
          <p className="text-[10px] text-[#C4B5BD]">Devas Unlimited Admin v2</p>
        </div>
      </aside>
    </>
  )
}
