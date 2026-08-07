import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HelpCircle, Check, Lock } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchJourneyProgress } from '@/services/journey'
import type { JourneyLevel } from '@/types/database'
import { JourneyLevelsPopup } from './JourneyLevelsPopup'

export function JourneyPage() {
  const { user } = useAuth()
  const [showPopup, setShowPopup] = useState(false)

  const { data: journey, isLoading, error, refetch } = useQuery({
    queryKey: ['journey-progress', user?.id],
    queryFn: () => fetchJourneyProgress(user!.id),
    enabled: Boolean(user?.id),
  })

  const currentLevelData = journey?.levels.find(l => l.level === journey.currentLevel)

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">My Journey</h1>
          <p className="text-[#8C7B85] text-sm mt-0.5">Your personal path of practice &amp; participation</p>
        </div>
        <button
          onClick={() => setShowPopup(true)}
          aria-label="How journey levels work"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#7C2447] bg-[#F9E2D8] px-3 py-2 rounded-full"
        >
          <HelpCircle size={14} />
          How it works?
        </button>
      </div>

      {isLoading ? (
        <div className="px-5 space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't load your journey.</p>
          <button onClick={() => refetch()} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">Try again</button>
        </div>
      ) : journey ? (
        <div className="px-5 pb-6 space-y-5">
          {/* Current Level Hero */}
          <div
            className="relative rounded-[24px] p-5 overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)' }}
          >
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
            <div className="relative z-10">
              <p className="text-xs font-bold tracking-widest text-white/60 uppercase mb-1">Level {journey.currentLevel}</p>
              <h2 className="text-2xl font-bold text-white mb-1">{currentLevelData?.name ?? 'Begin'}</h2>
              {journey.nextLevel && (
                <p className="text-sm text-white/60">Next: {journey.nextLevel.name}</p>
              )}
            </div>
          </div>

          {/* Your Progress */}
          <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <p className="text-sm font-bold text-[#321B26] mb-3">Your progress</p>
            <div className="grid grid-cols-3 gap-3">
              <ProgressStat
                value={journey.userStats.completedSessions}
                label="Sessions"
                required={journey.nextLevel?.required_sessions}
                bg="#F9E2D8"
              />
              <ProgressStat
                value={journey.userStats.attendedEvents}
                label="Events"
                required={journey.nextLevel?.required_events}
                bg="#DDE9D3"
              />
              <ProgressStat
                value={journey.userStats.meditationDays}
                label="Meditation days"
                required={journey.nextLevel?.required_meditation_days}
                bg="#E8DDF2"
              />
            </div>
          </div>

          {/* Level Timeline */}
          <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <div className="space-y-0">
              {journey.levels.map((level, i) => (
                <LevelTimelineItem
                  key={level.level}
                  level={level}
                  status={
                    level.level < journey.currentLevel ? 'completed' :
                    level.level === journey.currentLevel ? 'current' :
                    level.level === journey.currentLevel + 1 ? 'next' : 'locked'
                  }
                  isLast={i === journey.levels.length - 1}
                />
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {showPopup && (
        <JourneyLevelsPopup
          levels={journey?.levels ?? []}
          currentLevel={journey?.currentLevel ?? 1}
          onClose={() => setShowPopup(false)}
        />
      )}
    </AppShell>
  )
}

function ProgressStat({ value, label, required, bg }: {
  value: number
  label: string
  required?: number
  bg: string
}) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: bg }}>
      <p className="text-xl font-bold text-[#321B26]">
        {value}{required ? <span className="text-sm text-[#8C7B85]">/{required}</span> : null}
      </p>
      <p className="text-[10px] text-[#8C7B85] font-medium mt-0.5 leading-tight">{label}</p>
    </div>
  )
}

type LevelStatus = 'completed' | 'current' | 'next' | 'locked'

function LevelTimelineItem({ level, status, isLast }: {
  level: JourneyLevel
  status: LevelStatus
  isLast: boolean
}) {
  const configs: Record<LevelStatus, { dotBg: string; dotBorder: string; textColor: string; badge?: string; badgeBg?: string; badgeText?: string }> = {
    completed: { dotBg: '#7C2447', dotBorder: '#7C2447', textColor: '#321B26' },
    current: { dotBg: '#7C2447', dotBorder: '#7C2447', textColor: '#321B26', badge: 'YOU ARE HERE', badgeBg: '#F9E2D8', badgeText: '#7C2447' },
    next: { dotBg: 'white', dotBorder: '#7C2447', textColor: '#321B26', badge: 'NEXT', badgeBg: '#E8DDF2', badgeText: '#5B3A7C' },
    locked: { dotBg: '#F7F0E9', dotBorder: '#E8DDF2', textColor: '#8C7B85' },
  }
  const { dotBg, dotBorder, textColor, badge, badgeBg, badgeText } = configs[status]

  const requirementText = [
    level.required_sessions > 0 ? `${level.required_sessions} sessions` : null,
    level.required_events > 0 ? `${level.required_events} event${level.required_events > 1 ? 's' : ''}` : null,
    level.required_meditation_days > 0 ? `${level.required_meditation_days} meditation days` : null,
    level.required_retreats > 0 ? `${level.required_retreats} retreat` : null,
  ].filter(Boolean).join(' • ') || 'Create your account'

  return (
    <div className="flex gap-3">
      {/* Timeline connector */}
      <div className="flex flex-col items-center">
        <div
          className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors"
          style={{ background: dotBg, borderColor: dotBorder }}
        >
          {status === 'completed' && <Check size={10} className="text-white" strokeWidth={3} />}
          {status === 'locked' && <Lock size={9} className="text-[#C4B5BD]" />}
        </div>
        {!isLast && <div className="w-0.5 flex-1 mt-1 mb-0" style={{ background: status === 'completed' ? '#7C2447' : '#E8DDF2', minHeight: '24px' }} />}
      </div>

      {/* Content */}
      <div className="pb-5 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: textColor }}>{level.name}</span>
          {badge && (
            <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase" style={{ background: badgeBg, color: badgeText }}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: status === 'locked' ? '#C4B5BD' : '#8C7B85' }}>
          {requirementText}
        </p>
      </div>
    </div>
  )
}
