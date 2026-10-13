import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { HelpCircle, Check, Lock, Sparkles, RotateCcw } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { fetchJourneyProgress, formatLevelRequirements, startNewJourney } from '@/services/journey'
import type { JourneyLevel } from '@/types/database'
import { JourneyLevelsPopup } from './JourneyLevelsPopup'

export function JourneyPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [showPopup, setShowPopup] = useState(false)
  const [confirmRestart, setConfirmRestart] = useState(false)

  const { data: journey, isLoading, error, refetch } = useQuery({
    queryKey: ['journey-progress', user?.id],
    queryFn: () => fetchJourneyProgress(user!.id),
    enabled: Boolean(user?.id),
  })

  const restartMutation = useMutation({
    mutationFn: () => startNewJourney(user!.id),
    onSuccess: () => {
      setConfirmRestart(false)
      toast('A new journey begins. ✦', 'success')
      queryClient.invalidateQueries({ queryKey: ['journey-progress'] })
    },
    onError: () => toast('Could not start a new journey. Please try again.', 'error'),
  })

  const currentLevelData = journey?.levels.find(l => l.level === journey.currentLevel)
  const journeyNumber = (journey?.completedJourneys ?? 0) + 1

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
          className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#7C2447] bg-[#F9E2D8] px-3 py-2 rounded-full"
        >
          <HelpCircle size={14} />
          How it works?
        </button>
      </div>

      {isLoading ? (
        <div className="px-5 space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't load your journey.</p>
          <button onClick={() => refetch()} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">Try again</button>
        </div>
      ) : journey ? (
        <div className="px-5 pb-6 space-y-5">
          {/* Hero */}
          {journey.isComplete ? (
            <div
              className="relative rounded-[24px] p-5 overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #8B6914 0%, #7C2447 55%, #321B26 100%)' }}
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-[#E6B74B]/20" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-[#E6B74B] text-[#321B26] flex items-center justify-center">
                    <Sparkles size={16} />
                  </span>
                  <p className="text-[10px] font-bold tracking-widest text-[#FFE7A8] uppercase">Journey {journeyNumber} complete</p>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">Your journey is well done</h2>
                <p className="text-sm text-white/75 leading-relaxed">
                  You've walked the full path to {currentLevelData?.name ?? 'the final level'}. When you're ready, the map restarts and a new journey begins.
                </p>

                {confirmRestart ? (
                  <div className="mt-4 bg-white/10 border border-white/20 rounded-2xl p-3">
                    <p className="text-xs text-white/85 mb-3">Your map will restart from Begin. Your history is always kept.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => restartMutation.mutate()}
                        disabled={restartMutation.isPending}
                        className="flex-1 py-2.5 bg-white text-[#7C2447] rounded-full text-xs font-bold disabled:opacity-60"
                      >
                        {restartMutation.isPending ? 'Starting…' : 'Yes, begin again'}
                      </button>
                      <button
                        onClick={() => setConfirmRestart(false)}
                        className="flex-1 py-2.5 bg-white/10 border border-white/25 text-white rounded-full text-xs font-semibold"
                      >
                        Not yet
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmRestart(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#7C2447] rounded-full text-xs font-bold active:scale-[0.98] transition-transform"
                  >
                    <RotateCcw size={14} />
                    Begin a new journey
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="relative rounded-[24px] p-5 overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)' }}
            >
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/5" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-xs font-bold tracking-widest text-white/60 uppercase">Level {journey.currentLevel} of {journey.levels.length}</p>
                  {journey.completedJourneys > 0 && (
                    <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#E6B74B]/25 text-[#FFE7A8]">
                      Journey {journeyNumber}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">{currentLevelData?.name ?? 'Begin'}</h2>
                {journey.nextLevel && <p className="text-sm text-white/60">Next: {journey.nextLevel.name}</p>}
              </div>
            </div>
          )}

          {/* Progress toward next level */}
          <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <div className="flex items-baseline justify-between mb-3">
              <p className="text-sm font-bold text-[#321B26]">Your progress</p>
              <p className="text-[11px] text-[#8C7B85]">
                {journey.nextLevel ? `Toward ${journey.nextLevel.name}` : 'All levels complete'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ProgressStat value={journey.userStats.completedSessions} label="Sessions" required={journey.nextLevel?.required_sessions} bg="#F9E2D8" bar="#7C2447" />
              <ProgressStat value={journey.userStats.attendedEvents} label="Events" required={journey.nextLevel?.required_events} bg="#DDE9D3" bar="#2D6B4A" />
              <ProgressStat value={journey.userStats.meditationDays} label="Meditation days" required={journey.nextLevel?.required_meditation_days} bg="#E8DDF2" bar="#5B3A7C" />
              <ProgressStat value={journey.userStats.attendedRetreats} label="Retreats" required={journey.nextLevel?.required_retreats} bg="#FFF3D6" bar="#8B6914" />
            </div>
          </div>

          {/* Level timeline (map) */}
          <div className="bg-white rounded-[24px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            {journey.levels.map((level, i) => (
              <LevelTimelineItem
                key={level.level}
                level={level}
                status={
                  journey.isComplete || level.level < journey.currentLevel ? 'completed' :
                  level.level === journey.currentLevel ? 'current' :
                  level.level === journey.currentLevel + 1 ? 'next' : 'locked'
                }
                badge={journey.isComplete && i === journey.levels.length - 1 ? 'Journey complete' : undefined}
                isLast={i === journey.levels.length - 1}
              />
            ))}
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

function ProgressStat({ value, label, required, bg, bar }: {
  value: number
  label: string
  required?: number
  bg: string
  bar: string
}) {
  const hasTarget = Boolean(required)
  const met = hasTarget && value >= required!
  const pct = hasTarget ? Math.min(100, Math.round((value / required!) * 100)) : 100

  return (
    <div className="rounded-xl p-3" style={{ background: bg }}>
      <div className="flex items-start justify-between">
        <p className="text-xl font-bold text-[#321B26] leading-none">
          {value}{hasTarget && <span className="text-sm text-[#8C7B85] font-semibold">/{required}</span>}
        </p>
        {met && (
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-white" style={{ background: bar }} aria-label="Requirement met">
            <Check size={11} strokeWidth={3} />
          </span>
        )}
      </div>
      <p className="text-[10px] text-[#8C7B85] font-medium mt-1 leading-tight">{label}</p>
      {hasTarget && (
        <div className="h-1.5 rounded-full bg-white/70 mt-2 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={`${label} progress`}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: bar }} />
        </div>
      )}
    </div>
  )
}

type LevelStatus = 'completed' | 'current' | 'next' | 'locked'

function LevelTimelineItem({ level, status, isLast, badge: badgeOverride }: {
  level: JourneyLevel
  status: LevelStatus
  isLast: boolean
  badge?: string
}) {
  const configs: Record<LevelStatus, { dotBg: string; dotBorder: string; textColor: string; badge?: string; badgeBg?: string; badgeText?: string }> = {
    completed: { dotBg: '#7C2447', dotBorder: '#7C2447', textColor: '#321B26' },
    current: { dotBg: '#7C2447', dotBorder: '#7C2447', textColor: '#321B26', badge: 'You are here', badgeBg: '#F9E2D8', badgeText: '#7C2447' },
    next: { dotBg: 'white', dotBorder: '#7C2447', textColor: '#321B26', badge: 'Next', badgeBg: '#E8DDF2', badgeText: '#5B3A7C' },
    locked: { dotBg: '#F7F0E9', dotBorder: '#E8DDF2', textColor: '#8C7B85' },
  }
  const { dotBg, dotBorder, textColor, badgeBg, badgeText } = configs[status]
  const badge = badgeOverride ?? configs[status].badge

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
        {!isLast && <div className="w-0.5 flex-1 mt-1" style={{ background: status === 'completed' ? '#7C2447' : '#E8DDF2', minHeight: '24px' }} />}
      </div>

      {/* Content */}
      <div className={`${isLast ? 'pb-1' : 'pb-5'} flex-1 min-w-0`}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-sm" style={{ color: textColor }}>{level.name}</span>
          {badge && (
            <span
              className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase"
              style={badgeOverride ? { background: '#FFF3D6', color: '#8B6914' } : { background: badgeBg, color: badgeText }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs mt-0.5" style={{ color: status === 'locked' ? '#C4B5BD' : '#8C7B85' }}>
          {formatLevelRequirements(level)}
        </p>
      </div>
    </div>
  )
}
