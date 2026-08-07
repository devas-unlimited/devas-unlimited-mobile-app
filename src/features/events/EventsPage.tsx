import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, isPast } from 'date-fns'
import { MapPin, ChevronRight, Calendar } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { fetchEvents } from '@/services/events'
import type { Event } from '@/types/database'

const FILTERS = ['All', 'Retreats', 'Workshops', 'Events', 'News']

const CATEGORY_COLORS: Record<string, string> = {
  MUSIC: '#DDEDF1',
  LIVE: '#DDE9D3',
  RETREAT: '#E8DDF2',
  SESSION: '#F9E2D8',
  NEWS: '#FFF3D6',
  DEFAULT: '#F7F0E9',
}

const CATEGORY_TEXT: Record<string, string> = {
  MUSIC: '#1A6B7C',
  LIVE: '#2D6B4A',
  RETREAT: '#5B3A7C',
  SESSION: '#7C2447',
  NEWS: '#7C5C1A',
  DEFAULT: '#8C7B85',
}

function getCategoryKey(category: string) {
  return category.toUpperCase().split(' ')[0]
}

export function EventsPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['events', activeFilter],
    queryFn: () => fetchEvents(activeFilter === 'All' ? undefined : activeFilter.replace(/s$/, '')),
    staleTime: 1000 * 60 * 3,
  })

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[#321B26]">Events & Announcements</h1>
        <p className="text-[#8C7B85] text-sm mt-1">Discover everything happening at Devas Unlimited</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-none pb-1 mb-4">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            aria-pressed={activeFilter === f}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeFilter === f
                ? 'bg-[#7C2447] text-white'
                : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pb-6 space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : error ? (
          <ErrorState onRetry={() => refetch()} />
        ) : events.length === 0 ? (
          <EmptyState filter={activeFilter} />
        ) : (
          events.map(event => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </AppShell>
  )
}

function EventCard({ event }: { event: Event }) {
  const catKey = getCategoryKey(event.category)
  const tagBg = CATEGORY_COLORS[catKey] ?? CATEGORY_COLORS.DEFAULT
  const tagText = CATEGORY_TEXT[catKey] ?? CATEGORY_TEXT.DEFAULT
  const past = isPast(new Date(event.starts_at))

  const handleClick = () => {
    if (event.registration_url) {
      window.open(event.registration_url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div
      className={`bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] ${event.registration_url ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''}`}
      onClick={event.registration_url ? handleClick : undefined}
      role={event.registration_url ? 'button' : undefined}
      tabIndex={event.registration_url ? 0 : undefined}
      onKeyDown={event.registration_url ? (e) => e.key === 'Enter' && handleClick() : undefined}
      aria-label={event.registration_url ? `Open ${event.title}` : undefined}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl" style={{ background: tagBg }}>
          {getEventEmoji(event.category)}
        </div>

        <div className="flex-1 min-w-0">
          {/* Category badge */}
          <span
            className="inline-block text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full mb-1.5 uppercase"
            style={{ background: tagBg, color: tagText }}
          >
            {event.category}
          </span>

          <h3 className="font-semibold text-[#321B26] text-sm leading-tight mb-1">{event.title}</h3>

          <div className="flex items-center gap-2 text-[#8C7B85] text-xs">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {format(new Date(event.starts_at), 'd MMM, h:mm aa')}
            </span>
            {event.city && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {event.city}
                </span>
              </>
            )}
          </div>

          {past && (
            <span className="mt-1.5 inline-block text-[9px] font-semibold bg-[#F7F0E9] text-[#8C7B85] px-2 py-0.5 rounded-full uppercase tracking-wide">Past</span>
          )}
        </div>

        {event.registration_url && (
          <ChevronRight size={18} className="text-[#C4B5BD] flex-shrink-0 mt-0.5" />
        )}
      </div>
    </div>
  )
}

function getEventEmoji(category: string): string {
  const lower = category.toLowerCase()
  if (lower.includes('music') || lower.includes('kirtan')) return '🎵'
  if (lower.includes('retreat')) return '🏔️'
  if (lower.includes('moon') || lower.includes('meditation')) return '🌕'
  if (lower.includes('energy') || lower.includes('heal')) return '✨'
  if (lower.includes('yoga')) return '🧘'
  if (lower.includes('breathwork')) return '🌬️'
  return '✦'
}

function EmptyState({ filter }: { filter: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-[#F7F0E9] flex items-center justify-center mb-4 text-2xl">✦</div>
      <h3 className="text-[#321B26] font-semibold mb-1">No upcoming events yet</h3>
      <p className="text-[#8C7B85] text-sm">
        {filter !== 'All' ? `No ${filter.toLowerCase()} found. Try a different filter.` : 'Check back soon for upcoming events.'}
      </p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-[#8C7B85] text-sm mb-4">We couldn't load events right now.</p>
      <button onClick={onRetry} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">
        Try again
      </button>
    </div>
  )
}
