import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchMeditationInsights } from '@/services/meditation'
import type { MeditationSession } from '@/types/database'

export function MeditationInsightsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: insights, isLoading, error, refetch } = useQuery({
    queryKey: ['meditation-insights', user?.id],
    queryFn: () => fetchMeditationInsights(user!.id),
    enabled: Boolean(user?.id),
  })

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(50,27,38,0.08)]"
        >
          <ArrowLeft size={20} className="text-[#321B26]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#321B26]">Meditation Insights</h1>
          <p className="text-[#8C7B85] text-xs">A gentle look at your consistency</p>
        </div>
      </div>

      {isLoading ? (
        <div className="px-5 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't load your insights.</p>
          <button onClick={() => refetch()} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">Try again</button>
        </div>
      ) : !insights || insights.history.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-5 pb-6 space-y-4">
          {/* Weekly Total */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[10px] font-bold tracking-widest text-[#7C2447] uppercase mb-1">This week</p>
                <p className="text-4xl font-bold text-[#321B26]">{insights.weeklyMinutes}</p>
                <p className="text-sm text-[#8C7B85] font-medium">total minutes</p>
              </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-1 h-16" role="img" aria-label="Weekly meditation bar chart">
              {insights.weeklyDays.map(({ day, minutes }) => {
                const maxMins = Math.max(...insights.weeklyDays.map(d => d.minutes), 1)
                const heightPct = minutes > 0 ? Math.max(8, (minutes / maxMins) * 100) : 4
                return (
                  <div key={day} className="flex flex-col items-center flex-1 gap-1">
                    <div className="w-full flex flex-col justify-end" style={{ height: '48px' }}>
                      <div
                        className={`w-full rounded-t-md transition-all duration-300 ${minutes > 0 ? 'bg-[#7C2447]' : 'bg-[#F7F0E9]'}`}
                        style={{ height: `${heightPct}%` }}
                        aria-label={`${day}: ${minutes} minutes`}
                      />
                    </div>
                    <span className="text-[9px] text-[#8C7B85] font-medium">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <p className="text-sm font-bold text-[#321B26] mb-3">Highlights</p>
            <div className="grid grid-cols-3 gap-3">
              <HighlightCard value={`${insights.dailyAverage} min`} label="Daily average" bg="#DDEDF1" />
              <HighlightCard value={`${insights.longestStreak} days`} label="Longest streak" bg="#E8DDF2" />
              <HighlightCard value={`${insights.currentStreak} days`} label="Current streak" bg="#DDE9D3" />
            </div>
          </div>

          {/* History */}
          {insights.history.length > 0 && (
            <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
              <p className="text-sm font-bold text-[#321B26] mb-3">Meditation history</p>
              <div className="space-y-3">
                {insights.history.slice(0, 10).map(session => (
                  <HistoryItem key={session.id} session={session} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}

function HighlightCard({ value, label, bg }: { value: string; label: string; bg: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: bg }}>
      <p className="text-base font-bold text-[#321B26]">{value}</p>
      <p className="text-[10px] text-[#8C7B85] mt-0.5 font-medium leading-tight">{label}</p>
    </div>
  )
}

function HistoryItem({ session }: { session: MeditationSession }) {
  const minutes = Math.floor(session.duration_seconds / 60)
  const date = session.completed_at ? new Date(session.completed_at) : new Date(session.started_at)

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-[#4A3540] font-medium">{format(date, 'd MMM')}</p>
      <p className="text-sm font-semibold text-[#321B26]">{minutes} min</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-8">
      <div className="w-16 h-16 rounded-full bg-[#F7F0E9] flex items-center justify-center mb-4 text-2xl">🧘</div>
      <h3 className="text-[#321B26] font-semibold mb-2">Your practice awaits</h3>
      <p className="text-[#8C7B85] text-sm leading-relaxed">
        Complete your first meditation to see your insights here.
      </p>
    </div>
  )
}
