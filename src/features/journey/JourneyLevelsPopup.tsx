import { useEffect, useRef } from 'react'
import { X, BookOpen, Calendar, Sunrise, Mountain, RotateCcw } from 'lucide-react'
import type { JourneyLevel } from '@/types/database'
import { formatLevelRequirements } from '@/services/journey'

interface JourneyLevelsPopupProps {
  levels: JourneyLevel[]
  currentLevel: number
  onClose: () => void
}

export function JourneyLevelsPopup({ levels, currentLevel, onClose }: JourneyLevelsPopupProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<Element | null>(null)

  useEffect(() => {
    triggerRef.current = document.activeElement
    closeButtonRef.current?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      role="dialog"
      aria-modal="true"
      aria-label="How Journey Levels Work"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#321B26]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg mx-auto bg-white rounded-t-[32px] max-h-[88vh] flex flex-col">
        {/* Drag handle */}
        <div className="flex items-center justify-between px-5 pt-4 pb-0">
          <div className="mx-auto w-10 h-1 rounded-full bg-[#E8DDF2]" />
        </div>

        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <h2 className="text-lg font-bold text-[#321B26]">How Journey Levels Work</h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-[#F7F0E9] flex items-center justify-center text-[#8C7B85] hover:bg-[#F0E8E0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scroll content */}
        <div className="overflow-y-auto flex-1 px-5 pb-4 scrollbar-none">
          <p className="text-sm text-[#8C7B85] leading-relaxed mb-4">
            Your journey grows through real participation. Each level has clear requirements — complete all of them to unlock the next level.
          </p>

          {/* Category indicators */}
          <div className="flex flex-wrap gap-2 mb-5">
            <CategoryPill icon={<BookOpen size={12} />} label="Sessions" bg="#F9E2D8" color="#7C2447" />
            <CategoryPill icon={<Calendar size={12} />} label="Events" bg="#DDE9D3" color="#2D6B4A" />
            <CategoryPill icon={<Sunrise size={12} />} label="Meditation days" bg="#E8DDF2" color="#5B3A7C" />
            <CategoryPill icon={<Mountain size={12} />} label="Retreats" bg="#FFF3D6" color="#8B6914" />
          </div>

          {/* Level list */}
          <div className="space-y-3">
            {levels.map(level => {
              const isCurrent = level.level === currentLevel
              return (
                <div
                  key={level.level}
                  className={`rounded-[16px] p-4 border transition-all ${
                    isCurrent
                      ? 'bg-[#FCF7F0] border-[#7C2447]/20'
                      : 'bg-white border-[#F0E8EF]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#8C7B85] uppercase tracking-widest">
                        Level {level.level}
                      </span>
                      <span className="font-semibold text-sm text-[#321B26]">{level.name}</span>
                    </div>
                    {isCurrent && (
                      <span className="text-[9px] font-bold tracking-widest bg-[#7C2447] text-white px-2 py-0.5 rounded-full uppercase">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8C7B85]">
                    {formatLevelRequirements(level)}
                  </p>
                </div>
              )
            })}
          </div>

          <div className="mt-4 flex gap-3 rounded-[16px] p-4 bg-[#FFF3D6]">
            <RotateCcw size={16} className="text-[#8B6914] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#5C4A12] leading-relaxed">
              Reach the final level and your journey is well done. You can then begin a new journey — the map restarts and only new activity counts toward it.
            </p>
          </div>
        </div>

        {/* Got it button */}
        <div className="px-5 py-4 border-t border-[#F7F0E9]" style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))' }}>
          <button
            onClick={onClose}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold active:scale-[0.98] transition-transform"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}

function CategoryPill({ icon, label, bg, color }: { icon: React.ReactNode; label: string; bg: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: bg, color }}>
      {icon}
      {label}
    </div>
  )
}
