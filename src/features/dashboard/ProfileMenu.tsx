import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { getFirstName } from '@/lib/utils'

const APP_VERSION = '1.0.0'

export function ProfileMenu() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? 'Friend'
  const email = user?.email ?? ''
  const initials = getFirstName(displayName)[0]?.toUpperCase() ?? 'D'

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="w-10 h-10 rounded-full bg-[#7C2447] text-white flex items-center justify-center text-sm font-bold active:scale-95 transition-transform"
      >
        {initials}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-12 w-64 bg-white rounded-[20px] shadow-[0_8px_32px_rgba(50,27,38,0.14)] z-50 overflow-hidden"
        >
          {/* User info */}
          <div className="px-4 py-4 border-b border-[#F7F0E9]">
            <p className="font-semibold text-[#321B26] text-sm truncate">{displayName}</p>
            <p className="text-xs text-[#8C7B85] truncate">{email}</p>
          </div>

          {/* Actions */}
          <div className="py-2">
            <button
              role="menuitem"
              onClick={() => { setOpen(false); navigate('/profile') }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#4A3540] hover:bg-[#FCF7F0] transition-colors"
            >
              <Settings size={16} className="text-[#8C7B85]" />
              Account settings
            </button>
            <button
              role="menuitem"
              onClick={() => { setOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#4A3540] hover:bg-[#FCF7F0] transition-colors"
            >
              <User size={16} className="text-[#8C7B85]" />
              View profile
            </button>
          </div>

          {/* Sign out */}
          <div className="border-t border-[#F7F0E9] py-2">
            <button
              role="menuitem"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#7C2447] font-medium hover:bg-[#FCF7F0] transition-colors"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>

          {/* Version */}
          <div className="px-4 pb-3">
            <p className="text-[10px] text-[#C4B5BD]">v{APP_VERSION}</p>
          </div>
        </div>
      )}
    </div>
  )
}
