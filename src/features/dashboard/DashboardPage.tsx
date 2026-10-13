import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format, isToday, isTomorrow } from 'date-fns'
import { useLayoutEffect, useRef } from 'react'
import { ChevronRight, Flame, Megaphone, Play, Video, TrendingUp, Headphones, MapPin, BookOpen, ListMusic, LibraryBig, Clapperboard, Compass, CalendarDays, ArrowUpRight } from 'lucide-react'
import { AnnouncementCard } from '@/components/announcements/AnnouncementCard'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { fetchDashboardStats, fetchNextEvent, fetchActiveAnnouncements, dismissAnnouncement } from '@/services/dashboard'
import { fetchFeaturedEvents, fetchPublishedAnnouncements } from '@/services/events'
import { fetchJourneyProgress, type JourneyProgress } from '@/services/journey'
import { HighlightsCarousel } from './HighlightsCarousel'
import { InstallBanner } from './InstallBanner'
import { fetchLiveBanners } from '@/services/banners'
import { fetchNextSession } from '@/services/sessions'
import { fetchResources, isSoundCloudPlaylist, isYouTubeVideo, youtubeWatchUrl, formatListenDuration } from '@/services/sanctuary'
import { getFirstName } from '@/lib/utils'
import { getTodayIntention } from '@/lib/intentions'
import { ProfileMenu } from '@/features/dashboard/ProfileMenu'
import { Artwork } from '@/features/sanctuary/Artwork'
import type { Event, Resource } from '@/types/database'

function greeting(date = new Date()) {
  const h = date.getHours()
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
}

function friendlyDate(iso: string) {
  const d = new Date(iso)
  const time = format(d, 'h:mm aa')
  if (isToday(d)) return `Today • ${time}`
  if (isTomorrow(d)) return `Tomorrow • ${time}`
  return format(d, 'EEE, d MMM • h:mm aa')
}

export function DashboardPage() {
  const { user, profile } = useAuth()
  const queryClient = useQueryClient()
  const userId = user?.id
  const enabled = Boolean(userId)
  const firstName = getFirstName(profile?.full_name ?? user?.user_metadata?.full_name)

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: () => fetchDashboardStats(userId!),
    enabled,
  })
  const { data: journey } = useQuery({
    queryKey: ['journey-progress', userId],
    queryFn: () => fetchJourneyProgress(userId!),
    enabled,
  })
  const { data: nextSession } = useQuery({
    queryKey: ['sessions', userId, 'next'],
    queryFn: () => fetchNextSession(userId!),
    enabled,
  })
  const { data: banners = [] } = useQuery({ queryKey: ['banners', 'live'], queryFn: fetchLiveBanners, staleTime: 1000 * 60 * 5 })
  const { data: featuredEvents = [] } = useQuery({ queryKey: ['events', 'featured'], queryFn: () => fetchFeaturedEvents(), staleTime: 1000 * 60 * 5 })
  const { data: nextEvent } = useQuery({ queryKey: ['events', 'next'], queryFn: fetchNextEvent, staleTime: 1000 * 60 * 5 })
  const { data: publishedAnnouncements = [] } = useQuery({
    queryKey: ['announcements', 'published'],
    queryFn: () => fetchPublishedAnnouncements(),
    staleTime: 1000 * 60 * 2,
  })
  const { data: playlists = [], isPending: playlistsPending } = useQuery({
    queryKey: ['sanctuary', 'resources', 'listen'],
    queryFn: () => fetchResources('listen'),
    staleTime: 1000 * 60 * 5,
  })
  const { data: videos = [], isPending: videosPending } = useQuery({
    queryKey: ['sanctuary', 'resources', 'watch'],
    queryFn: () => fetchResources('watch'),
    staleTime: 1000 * 60 * 5,
  })
  // Wait for both lists so cards aren't inserted ahead of the one the row has snapped to
  const sanctuaryPicks = playlistsPending || videosPending ? [] : interleave(latest(videos, 4), latest(playlists, 4))
  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', userId],
    queryFn: () => fetchActiveAnnouncements(userId!),
    enabled,
    staleTime: 1000 * 60 * 2,
  })

  const dismissMutation = useMutation({
    mutationFn: (announcementId: string) => dismissAnnouncement(userId!, announcementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements', userId] }),
  })

  // Featured items go to the Highlights banners; lists below skip them to avoid repeats
  const featuredAnnouncements = publishedAnnouncements.filter(a => a.is_featured)
  const otherAnnouncements = announcements.filter(a => !a.is_featured)
  const upNext = nextEvent && !featuredEvents.some(e => e.id === nextEvent.id) ? nextEvent : null

  return (
    <AppShell>
      {/* Header */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-wide text-[#8C7B85] uppercase">{format(new Date(), 'EEEE, d MMMM')}</p>
          <h1 className="text-2xl font-bold text-[#321B26] mt-0.5">{greeting()}, {firstName}</h1>
        </div>
        <ProfileMenu />
      </div>

      <div className="px-5 pb-8 space-y-7">
        <IntentionHero minutesToday={stats?.minutesToday ?? 0} streak={stats?.dayStreak ?? 0} />

        <InstallBanner />

        <HighlightsCarousel banners={banners} events={featuredEvents} announcements={featuredAnnouncements} />

        {otherAnnouncements.length > 0 && (
          <section>
            <SectionHeader icon={<Megaphone size={14} className="text-[#7C2447]" />} title="From Devas" link={{ to: '/events', label: 'All news' }} />
            <div className="space-y-3">
              {otherAnnouncements.map(a => (
                <AnnouncementCard key={a.id} announcement={a} onDismiss={() => dismissMutation.mutate(a.id)} />
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader icon={<Compass size={14} className="text-[#7C2447]" />} title="Your path" />
          <div className="grid grid-cols-2 gap-3">
            {journey ? <JourneyTile journey={journey} /> : <div className="rounded-[22px] bg-white/60 min-h-[156px]" />}
            <SessionTile session={nextSession ?? null} />
          </div>
        </section>

        {upNext && <EventHighlight event={upNext} />}

        {sanctuaryPicks.length > 0 && (
          <section>
            <SectionHeader icon={<LibraryBig size={14} className="text-[#7C2447]" />} title="From the Sanctuary" link={{ to: '/sanctuary', label: 'See all' }} />
            {/* Keyed on the cards shown, so the row remounts at the first card whenever the list changes */}
            <SanctuaryRow key={sanctuaryPicks.map(r => r.id).join()} items={sanctuaryPicks} />
          </section>
        )}
      </div>
    </AppShell>
  )
}

function SectionHeader({ title, icon, link }: { title: string; icon?: React.ReactNode; link?: { to: string; label: string } }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-sm font-bold text-[#321B26]">{title}</h2>
      </div>
      {link && (
        <Link to={link.to} className="text-xs text-[#7C2447] font-semibold flex items-center gap-0.5">
          {link.label} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  )
}

function IntentionHero({ minutesToday, streak }: { minutesToday: number; streak: number }) {
  return (
    <div
      className="relative rounded-[24px] overflow-hidden p-5"
      style={{ background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)' }}
    >
      <OrgBlobs />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-bold tracking-widest text-[#E6B74B] uppercase">Today's intention</p>
          {streak > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-white/15 px-2 py-1 rounded-full">
              <Flame size={11} className="text-[#E6B74B]" /> {streak}-day streak
            </span>
          )}
        </div>
        <h2 className="text-xl font-bold text-white leading-snug mb-1.5">{getTodayIntention()}</h2>
        <p className="text-sm text-white/70 mb-4">
          {minutesToday > 0
            ? `Beautiful — ${minutesToday} min of stillness today. ✦`
            : 'Take a few quiet minutes to return to yourself.'}
        </p>
        <Link
          to="/meditate"
          className="inline-flex items-center gap-2 pl-2 pr-4 py-2 bg-white text-[#7C2447] text-xs font-bold rounded-full active:scale-[0.97] transition-transform"
        >
          <span className="w-6 h-6 rounded-full bg-[#7C2447] text-white flex items-center justify-center">
            <Play size={11} fill="currentColor" className="ml-0.5" />
          </span>
          {minutesToday > 0 ? 'Meditate again' : 'Begin meditation'}
        </Link>
      </div>
    </div>
  )
}

function journeyPercent(journey: JourneyProgress) {
  const next = journey.nextLevel
  if (!next) return 100
  const parts = [
    [journey.userStats.completedSessions, next.required_sessions],
    [journey.userStats.attendedEvents, next.required_events],
    [journey.userStats.meditationDays, next.required_meditation_days],
    [journey.userStats.attendedRetreats, next.required_retreats],
  ].filter(([, req]) => req > 0)
  if (parts.length === 0) return 100
  return Math.round((parts.reduce((sum, [have, req]) => sum + Math.min(1, have / req), 0) / parts.length) * 100)
}

const TILE = 'group flex flex-col min-h-[156px] bg-white rounded-[22px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] active:scale-[0.97] transition-transform'

function TileTop({ icon, tone }: { icon: React.ReactNode; tone: string }) {
  return (
    <div className="flex items-start justify-between">
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${tone}`}>{icon}</div>
      <span className="w-7 h-7 rounded-full bg-[#FCF7F0] text-[#C4B5BD] flex items-center justify-center group-hover:text-[#7C2447] transition-colors">
        <ArrowUpRight size={14} />
      </span>
    </div>
  )
}

function JourneyTile({ journey }: { journey: JourneyProgress }) {
  const level = journey.levels.find(l => l.level === journey.currentLevel)
  const pct = journeyPercent(journey)

  return (
    <Link to="/journey" className={TILE}>
      <TileTop icon={<TrendingUp size={18} />} tone="bg-[#E8DDF2] text-[#5B3A7C]" />
      <p className="mt-3 text-[10px] font-bold tracking-widest text-[#8C7B85] uppercase">Journey • Lv {journey.currentLevel}</p>
      <p className="font-bold text-[#321B26] text-[15px] leading-snug truncate">
        {journey.isComplete ? 'Complete ✦' : level?.name ?? 'Begin'}
      </p>
      <div className="mt-auto pt-3">
        <div className="h-1.5 rounded-full bg-[#F3ECF6] overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Journey progress">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 3)}%`, background: 'linear-gradient(90deg, #7C2447, #B5476F)' }} />
        </div>
        <p className="mt-1.5 text-[10px] text-[#8C7B85] truncate">
          <span className="font-semibold text-[#7C2447]">{pct}%</span>
          {journey.nextLevel ? ` to ${journey.nextLevel.name}` : ' • all levels'}
        </p>
      </div>
    </Link>
  )
}

function SessionTile({ session }: { session: { id: string; title: string; starts_at: string; coach_name: string | null } | null }) {
  return (
    <Link to={session ? `/sessions/${session.id}` : '/sessions'} className={TILE}>
      <TileTop icon={session ? <Video size={18} /> : <BookOpen size={18} />} tone="bg-[#DDE9D3] text-[#2D6B4A]" />
      <p className="mt-3 text-[10px] font-bold tracking-widest text-[#8C7B85] uppercase">{session ? 'Next session' : 'Sessions'}</p>
      <p className="font-bold text-[#321B26] text-[15px] leading-snug line-clamp-2">{session ? session.title : 'History & recordings'}</p>
      <p className="mt-auto pt-3 text-[10px] text-[#8C7B85] truncate">
        {session ? friendlyDate(session.starts_at) : 'Notes, replays & more'}
      </p>
    </Link>
  )
}

function EventHighlight({ event }: { event: Event }) {
  const isRetreat = event.category === 'Retreat'
  const body = (
    <>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-white/20 text-white">
          Up next
        </span>
        <span className="text-[9px] font-bold tracking-widest uppercase text-white/70">{event.category} • {event.format}</span>
      </div>
      <h3 className="text-lg font-bold text-white leading-snug">{event.title}</h3>
      <div className="flex items-center gap-3 text-xs text-white/75 mt-1 flex-wrap">
        <span>{friendlyDate(event.starts_at)}</span>
        {event.city && <span className="flex items-center gap-1"><MapPin size={11} /> {event.city}</span>}
      </div>
      <span className="mt-3 inline-block px-4 py-2 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-full">
        {event.registration_url ? 'Explore & register' : 'View events'}
      </span>
    </>
  )
  const className = 'relative block rounded-[24px] overflow-hidden p-5 active:scale-[0.98] transition-transform'
  const style = {
    background: event.cover_image_url
      ? `linear-gradient(160deg, rgba(50,27,38,0.55), rgba(50,27,38,0.92)), url(${event.cover_image_url}) center/cover`
      : isRetreat ? 'linear-gradient(145deg, #5B3A7C 0%, #321B26 100%)' : 'linear-gradient(145deg, #B5476F 0%, #5B1A35 100%)',
  }

  return (
    <section>
      <SectionHeader icon={<CalendarDays size={14} className="text-[#7C2447]" />} title="Coming up" link={{ to: '/events', label: 'View all' }} />
      {event.registration_url ? (
        <a href={event.registration_url} target="_blank" rel="noopener noreferrer" className={className} style={style}>{body}</a>
      ) : (
        <Link to="/events" className={className} style={style}>{body}</Link>
      )}
    </section>
  )
}

/** Newest first by release date */
function latest(items: Resource[], count: number) {
  const time = (r: Resource) => (r.published_at ? new Date(r.published_at).getTime() : 0)
  return [...items].sort((a, b) => time(b) - time(a)).slice(0, count)
}

/** Alternates video, audio, video, audio… so both kinds show up front */
function interleave(a: Resource[], b: Resource[]) {
  return Array.from({ length: Math.max(a.length, b.length) }, (_, i) => [a[i], b[i]]).flat().filter((r): r is Resource => Boolean(r))
}

function SanctuaryRow({ items }: { items: Resource[] }) {
  const ref = useRef<HTMLDivElement>(null)
  // Start at the first card, even if the browser tries to restore or re-snap the row
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollLeft = 0
  }, [])
  return (
    <div ref={ref} className="flex items-start gap-3 overflow-x-auto scrollbar-none -mx-5 px-5 scroll-px-5 pb-1 snap-x snap-mandatory">
      {items.map(r => <SanctuaryTile key={r.id} resource={r} />)}
      {/* Keeps the same 20px gap after the last card (end padding is dropped in scroll rows) */}
      <div className="w-2 flex-shrink-0" aria-hidden="true" />
    </div>
  )
}

/** Same-height tiles: videos keep their 16:9 frame, playlists stay square */
function SanctuaryTile({ resource }: { resource: Resource }) {
  const isVideo = isYouTubeVideo(resource)
  const duration = formatListenDuration(resource.duration_minutes)
  const meta = isVideo
    ? [resource.facilitator_name, duration].filter(Boolean).join(' • ')
    : resource.track_count != null ? `${resource.track_count} ${resource.track_count === 1 ? 'track' : 'tracks'}` : duration

  const inner = (
    <>
      <div className="relative h-36 rounded-2xl overflow-hidden shadow-[0_6px_18px_rgba(50,27,38,0.15)]">
        <Artwork resource={resource} className="w-full h-full" />
        {isVideo && <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-[#321B26]/65 text-white backdrop-blur-md ring-1 ring-white/20">
          {isVideo ? <Clapperboard size={9} /> : <Headphones size={9} />}
          {isVideo ? 'Video' : 'Audio'}
        </span>
        {isVideo && duration && (
          <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/75 text-white text-[9px] font-semibold">{duration}</span>
        )}
        <span className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/95 text-[#7C2447] flex items-center justify-center shadow-md">
          <Play size={13} fill="currentColor" className="ml-0.5" />
        </span>
      </div>
      <p className="mt-2 text-xs font-semibold text-[#321B26] leading-snug line-clamp-2">{resource.title}</p>
      {meta && (
        <p className="text-[10px] text-[#8C7B85] mt-0.5 flex items-center gap-1 truncate">
          {!isVideo && resource.track_count != null && <ListMusic size={10} className="flex-shrink-0" />}
          <span className="truncate">{meta}</span>
        </p>
      )}
    </>
  )
  const className = `block flex-shrink-0 snap-start active:scale-[0.97] transition-transform ${isVideo ? 'w-64' : 'w-36'}`

  if (isSoundCloudPlaylist(resource)) return <Link to={`/sanctuary/${resource.id}`} className={className}>{inner}</Link>
  return (
    <a href={isVideo ? youtubeWatchUrl(resource) : resource.external_url} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  )
}
