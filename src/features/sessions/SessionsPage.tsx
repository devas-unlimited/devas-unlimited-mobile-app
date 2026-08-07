import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronRight, Video, CheckCircle } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { SessionCardSkeleton } from '@/components/ui/Skeleton'
import { fetchUserSessions } from '@/services/sessions'
import type { SessionWithParticipant } from '@/services/sessions'

const FILTERS = ['All', '1:1', 'Group']

export function SessionsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sessions', user?.id, activeFilter],
    queryFn: () => fetchUserSessions(user!.id, activeFilter),
    enabled: Boolean(user?.id),
  })

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[#321B26]">Previous Sessions</h1>
        <p className="text-[#8C7B85] text-sm mt-1">Everything you've experienced in one place</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 px-5 mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            aria-pressed={activeFilter === f}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeFilter === f
                ? 'bg-[#7C2447] text-white'
                : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="px-5 pb-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SessionCardSkeleton key={i} />)
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : sessions.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          sessions.map(session => (
            <SessionCard
              key={session.id}
              session={session}
              onClick={() => navigate(`/sessions/${session.id}`)}
            />
          ))
        )}
      </div>
    </AppShell>
  )
}

function SessionCard({ session, onClick }: { session: SessionWithParticipant; onClick: () => void }) {
  const hasRecording = session.recording_status === 'available'
  const isCompleted = session.status === 'completed'
  const isGroup = session.session_kind === 'group'

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] flex items-center gap-3 active:scale-[0.98] transition-transform duration-150"
    >
      {/* Icon */}
      <div className={`w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-lg ${isGroup ? 'bg-[#DDE9D3]' : 'bg-[#F9E2D8]'}`}>
        {isGroup ? '👥' : '👤'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#321B26] text-sm truncate">{session.title}</p>
        <p className="text-xs text-[#8C7B85] mt-0.5">
          {format(new Date(session.starts_at), 'd MMM • h:mm aa')}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          {isCompleted && !hasRecording && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#DDE9D3] text-[#2D6B4A] px-2 py-0.5 rounded-full uppercase tracking-wide">
              <CheckCircle size={10} /> Completed
            </span>
          )}
          {hasRecording && (
            <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#DDEDF1] text-[#1A6B7C] px-2 py-0.5 rounded-full uppercase tracking-wide">
              <Video size={10} /> Recording
            </span>
          )}
        </div>
      </div>

      <ChevronRight size={18} className="text-[#C4B5BD] flex-shrink-0" />
    </button>
  )
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-[#F7F0E9] flex items-center justify-center mb-4 text-2xl">📋</div>
      <h3 className="text-[#321B26] font-semibold mb-1">Your journey is just beginning</h3>
      <p className="text-[#8C7B85] text-sm">
        {filter !== 'All' ? `No ${filter} sessions yet.` : 'Your sessions will appear here after they are completed.'}
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-[#8C7B85] text-sm mb-4">We couldn't load your sessions.</p>
      <button onClick={onRetry} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">
        Try again
      </button>
    </div>
  )
}
