import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, isPast } from 'date-fns'
import { MapPin, ChevronRight, Calendar, Megaphone, Mountain, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { fetchEvents, fetchPublishedAnnouncements, type EventCategory } from '@/services/events'
import type { Event } from '@/types/database'

type Tab = 'All' | 'Events' | 'Retreats' | 'Announcements'

const TABS: { id: Tab; icon?: React.ReactNode }[] = [
  { id: 'All' },
  { id: 'Events', icon: <Sparkles size={13} /> },
  { id: 'Retreats', icon: <Mountain size={13} /> },
  { id: 'Announcements', icon: <Megaphone size={13} /> },
]

const TAB_CATEGORY: Partial<Record<Tab, EventCategory>> = { Events: 'Event', Retreats: 'Retreat' }

const CATEGORY_STYLE: Record<string, { bg: string; text: string; emoji: string }> = {
  Retreat: { bg: '#E8DDF2', text: '#5B3A7C', emoji: '🏔️' },
  Event: { bg: '#F9E2D8', text: '#7C2447', emoji: '✨' },
}

export function EventsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('All')
  const showEvents = activeTab !== 'Announcements'
  const showAnnouncements = activeTab === 'All' || activeTab === 'Announcements'

  const eventsQuery = useQuery({
    queryKey: ['events', activeTab],
    queryFn: () => fetchEvents(TAB_CATEGORY[activeTab]),
    enabled: showEvents,
    staleTime: 1000 * 60 * 3,
  })

  const announcementsQuery = useQuery({
    queryKey: ['announcements', 'published'],
    queryFn: () => fetchPublishedAnnouncements(),
    enabled: showAnnouncements,
    staleTime: 1000 * 60 * 2,
  })

  const announcements = announcementsQuery.data ?? []
  const events = eventsQuery.data ?? []
  const isLoading = (showEvents && eventsQuery.isLoading) || (showAnnouncements && announcementsQuery.isLoading)
  const error = (showEvents && eventsQuery.error) || (showAnnouncements && announcementsQuery.error)
  const refetch = () => { if (showEvents) eventsQuery.refetch(); if (showAnnouncements) announcementsQuery.refetch() }

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-[#321B26]">Events & Announcements</h1>
        <p className="text-[#8C7B85] text-sm mt-1">Discover everything happening at Devas Unlimited</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-none pb-1 mb-4" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            onClick={() => setActiveTab(t.id)}
            aria-selected={activeTab === t.id}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeTab === t.id
                ? 'bg-[#7C2447] text-white'
                : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'
            }`}
          >
            {t.icon}
            {t.id}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pb-6">
        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : error ? (
          <ErrorState onRetry={refetch} />
        ) : activeTab === 'Announcements' ? (
          announcements.length === 0
            ? <EmptyState title="No announcements right now" message="News and updates from Devas will appear here." />
            : <div className="space-y-3">{announcements.map(a => <AnnouncementCard key={a.id} announcement={a} showDate />)}</div>
        ) : activeTab === 'All' ? (
          announcements.length === 0 && events.length === 0 ? (
            <EmptyState title="Nothing here yet" message="Check back soon for events, retreats and announcements." />
          ) : (
            <div className="space-y-6">
              {announcements.length > 0 && (
                <section>
                  <SectionHeader
                    title="Latest announcements"
                    action={announcements.length > 2 ? { label: 'See all', onClick: () => setActiveTab('Announcements') } : undefined}
                  />
                  <div className="space-y-3">
                    {announcements.slice(0, 2).map(a => <AnnouncementCard key={a.id} announcement={a} showDate />)}
                  </div>
                </section>
              )}
              {events.length > 0 && (
                <section>
                  <SectionHeader title="Events & retreats" />
                  <div className="space-y-3">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
                </section>
              )}
            </div>
          )
        ) : events.length === 0 ? (
          <EmptyState
            title={`No ${activeTab.toLowerCase()} yet`}
            message={`Upcoming ${activeTab.toLowerCase()} will appear here. Check back soon.`}
          />
        ) : (
          <div className="space-y-3">{events.map(e => <EventCard key={e.id} event={e} />)}</div>
        )}
      </div>
    </AppShell>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-[#321B26]">{title}</h2>
      {action && (
        <button onClick={action.onClick} className="text-xs text-[#7C2447] font-semibold flex items-center gap-0.5">
          {action.label} <ChevronRight size={14} />
        </button>
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event }) {
  const style = CATEGORY_STYLE[event.category] ?? CATEGORY_STYLE.Event
  const past = isPast(new Date(event.ends_at ?? event.starts_at))
  const open = () => event.registration_url && window.open(event.registration_url, '_blank', 'noopener,noreferrer')
  const clickable = Boolean(event.registration_url)

  return (
    <div
      className={`bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] ${past ? 'opacity-70' : ''} ${clickable ? 'cursor-pointer active:scale-[0.98] transition-transform duration-150' : ''}`}
      onClick={clickable ? open : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => e.key === 'Enter' && open() : undefined}
      aria-label={clickable ? `Open ${event.title}` : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center text-xl overflow-hidden" style={{ background: style.bg }}>
          {event.cover_image_url
            ? <img src={event.cover_image_url} alt="" className="w-full h-full object-cover" loading="lazy" />
            : style.emoji}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase" style={{ background: style.bg, color: style.text }}>
              {event.category}
            </span>
            {event.format && (
              <span className="text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full uppercase bg-[#F7F0E9] text-[#8C7B85]">
                {event.format}
              </span>
            )}
            {past && (
              <span className="text-[9px] font-semibold tracking-wide px-2 py-0.5 rounded-full uppercase bg-[#F7F0E9] text-[#8C7B85]">Past</span>
            )}
          </div>

          <h3 className="font-semibold text-[#321B26] text-sm leading-tight mb-1">{event.title}</h3>

          <div className="flex items-center gap-2 text-[#8C7B85] text-xs flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {event.all_day ? format(new Date(event.starts_at), 'd MMM') : format(new Date(event.starts_at), 'd MMM, h:mm aa')}
              {event.ends_at && format(new Date(event.ends_at), 'd MMM') !== format(new Date(event.starts_at), 'd MMM') && ` – ${format(new Date(event.ends_at), 'd MMM')}`}
            </span>
            {event.city && (
              <span className="flex items-center gap-1">
                <MapPin size={11} />
                {event.city}
              </span>
            )}
          </div>
        </div>

        {clickable && <ChevronRight size={18} className="text-[#C4B5BD] flex-shrink-0 mt-0.5" />}
      </div>
    </div>
  )
}

function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="w-14 h-14 rounded-full bg-[#F7F0E9] flex items-center justify-center mb-4 text-2xl">✦</div>
      <h3 className="text-[#321B26] font-semibold mb-1">{title}</h3>
      <p className="text-[#8C7B85] text-sm">{message}</p>
    </div>
  )
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <p className="text-[#8C7B85] text-sm mb-4">We couldn't load this right now.</p>
      <button onClick={onRetry} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">
        Try again
      </button>
    </div>
  )
}
