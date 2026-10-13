import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Play, ChevronRight, ListMusic, Clock, Sparkles, Clapperboard, Headphones } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchResources, isSoundCloudPlaylist, isYouTubeVideo, youtubeWatchUrl, formatListenDuration } from '@/services/sanctuary'
import type { Resource } from '@/types/database'
import { Artwork, CategoryIcon } from './Artwork'
import { VideoCard, VideoTile } from './VideoCard'

const FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'watch', label: 'Watch' },
  { id: 'listen', label: 'Listen' },
]

const PROVIDER_LABELS: Record<string, string> = {
  youtube: 'YOUTUBE',
  vimeo: 'VIMEO',
  soundcloud: 'SOUNDCLOUD',
  spotify: 'SPOTIFY',
  meditation: 'MEDITATION',
}

const PROVIDER_COLORS: Record<string, { bg: string; text: string }> = {
  youtube: { bg: '#FDECEA', text: '#C0392B' },
  vimeo: { bg: '#DDEDF1', text: '#1A6B7C' },
  soundcloud: { bg: '#FFF3D6', text: '#7C5C1A' },
  spotify: { bg: '#DDE9D3', text: '#2D6B4A' },
  meditation: { bg: '#E8DDF2', text: '#5B3A7C' },
  default: { bg: '#F7F0E9', text: '#8C7B85' },
}

export function SanctuaryPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: resources = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sanctuary', 'resources', activeFilter],
    queryFn: () => fetchResources(activeFilter === 'All' ? undefined : activeFilter),
    staleTime: 1000 * 60 * 5,
  })


  return (
    <AppShell>
      <div className="px-5 pt-8 pb-2">
        <h1 className="text-2xl font-bold text-[#321B26]">Devas Sanctuary</h1>
        <p className="text-[#8C7B85] text-sm mt-1">A curated space to watch, listen &amp; return within</p>
      </div>

      {/* Free Library Hero */}
      <div className="px-5 my-4">
        <div
          className="relative rounded-[24px] overflow-hidden p-5 min-h-[140px] flex flex-col justify-end"
          style={{ background: 'linear-gradient(145deg, #321B26 0%, #5B1A35 100%)' }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/5" />
          <div className="relative z-10">
            <p className="text-[10px] font-bold tracking-widest text-[#E6B74B] uppercase mb-1">Free Library</p>
            <h2 className="text-lg font-bold text-white mb-0.5">Nourishment for your inner journey</h2>
            <p className="text-xs text-white/60 mb-3">Talks • Meditations • Music • Reflections</p>
            <button
              onClick={() => setActiveFilter('listen')}
              className="inline-block px-4 py-2 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-full"
            >
              Start exploring
            </button>
          </div>
        </div>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 px-5 overflow-x-auto scrollbar-none pb-1 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            aria-pressed={activeFilter === f.id}
            className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-150 ${
              activeFilter === f.id
                ? 'bg-[#7C2447] text-white'
                : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'
            }`}
          >
            {f.id !== 'All' && <CategoryIcon category={f.id} />}
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-5 space-y-4">
          <Skeleton className="h-44 w-full" />
          <div className="grid grid-cols-1 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
          </div>
        </div>
      ) : error ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't load the sanctuary right now.</p>
          <button onClick={() => refetch()} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">Try again</button>
        </div>
      ) : resources.length === 0 ? (
        <EmptyState />
      ) : activeFilter === 'watch' ? (
        <WatchView videos={resources} />
      ) : activeFilter === 'listen' ? (
        <ListenView resources={resources} />
      ) : (
        <AllView resources={resources} onSeeAll={setActiveFilter} />
      )}
    </AppShell>
  )
}

function SectionHeading({ icon, title, count, onSeeAll }: { icon: React.ReactNode; title: string; count?: number; onSeeAll?: () => void }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="flex items-center gap-2 text-sm font-bold text-[#321B26]">
        <span className="text-[#7C2447]">{icon}</span>
        {title}
      </h2>
      {onSeeAll ? (
        <button onClick={onSeeAll} className="flex items-center gap-0.5 text-xs font-semibold text-[#7C2447]">
          See all <ChevronRight size={14} />
        </button>
      ) : count != null && (
        <span className="text-xs text-[#8C7B85]">{count} {count === 1 ? 'item' : 'items'}</span>
      )}
    </div>
  )
}

function WatchView({ videos }: { videos: Resource[] }) {
  const [topic, setTopic] = useState('all')
  const topics = [...new Set(videos.map(v => v.tags?.[0]).filter((t): t is string => Boolean(t)))]
  const filtered = topic === 'all' ? videos : videos.filter(v => v.tags?.[0] === topic)
  const featured = topic === 'all' ? (filtered.find(v => v.is_featured) ?? filtered[0]) : undefined
  const rest = filtered.filter(v => v !== featured)

  return (
    <div className="px-5 pb-6 space-y-6">
      {featured && (
        <section>
          <SectionHeading icon={<Sparkles size={14} />} title="Featured video" />
          <VideoCard resource={featured} featured />
        </section>
      )}

      <section>
        <SectionHeading icon={<Clapperboard size={14} />} title={topic === 'all' ? 'More videos' : topic} count={rest.length} />
        {topics.length > 1 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-none -mx-5 px-5 pb-1 mb-4">
            {['all', ...topics].map(t => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                aria-pressed={topic === t}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                  topic === t ? 'bg-[#321B26] text-white' : 'bg-[#F7F0E9] text-[#8C7B85]'
                }`}
              >
                {t === 'all' ? 'All topics' : t}
              </button>
            ))}
          </div>
        )}
        <div className="space-y-4">
          {rest.map(v => <VideoCard key={v.id} resource={v} />)}
        </div>
      </section>
    </div>
  )
}

function ListenView({ resources }: { resources: Resource[] }) {
  const featured = resources.find(r => r.is_featured)
  const regular = resources.filter(r => r !== featured)
  return (
    <div className="px-5 pb-6 space-y-6">
      {featured && (
        <section>
          <SectionHeading icon={<Sparkles size={14} />} title="Featured playlist" />
          <FeaturedCard resource={featured} />
        </section>
      )}
      {regular.length > 0 && (
        <section>
          <SectionHeading icon={<ListMusic size={14} />} title="Playlists" count={regular.length} />
          <div className="space-y-3">
            {regular.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function AllView({ resources, onSeeAll }: { resources: Resource[]; onSeeAll: (filter: string) => void }) {
  const videos = resources.filter(r => r.category === 'watch' && isYouTubeVideo(r))
  const playlists = resources.filter(r => r.category === 'listen')
  const others = resources.filter(r => !videos.includes(r) && !playlists.includes(r))
  const featuredPlaylist = playlists.find(r => r.is_featured)

  return (
    <div className="px-5 pb-6 space-y-7">
      {videos.length > 0 && (
        <section>
          <SectionHeading icon={<Clapperboard size={14} />} title="Latest videos" onSeeAll={() => onSeeAll('watch')} />
          <div className="flex gap-3 overflow-x-auto scrollbar-none -mx-5 px-5 scroll-px-5 pb-1 snap-x snap-mandatory">
            {videos.slice(0, 10).map(v => <VideoTile key={v.id} resource={v} />)}
            {/* Keeps the same 20px gap after the last card (end padding is dropped in scroll rows) */}
            <div aria-hidden="true" className="w-2 flex-shrink-0" />
          </div>
        </section>
      )}

      {playlists.length > 0 && (
        <section>
          <SectionHeading icon={<Headphones size={14} />} title="Playlists" onSeeAll={() => onSeeAll('listen')} />
          <div className="space-y-3">
            {featuredPlaylist && <FeaturedCard resource={featuredPlaylist} />}
            {playlists.filter(p => p !== featuredPlaylist).map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <SectionHeading icon={<Sparkles size={14} />} title="More to explore" count={others.length} />
          <div className="space-y-3">
            {others.map(r => <ResourceCard key={r.id} resource={r} />)}
          </div>
        </section>
      )}
    </div>
  )
}

/** Opens playlists in-app, everything else in a new tab */
function ResourceLink({ resource, className, children }: { resource: Resource; className: string; children: React.ReactNode }) {
  if (isSoundCloudPlaylist(resource)) {
    return (
      <Link to={`/sanctuary/${resource.id}`} className={className} aria-label={`Open playlist ${resource.title}`}>
        {children}
      </Link>
    )
  }
  return (
    <a href={youtubeWatchUrl(resource)} target="_blank" rel="noopener noreferrer" className={className} aria-label={`Open ${resource.title} on ${resource.provider}`}>
      {children}
    </a>
  )
}

function MetaLine({ resource, light = false }: { resource: Resource; light?: boolean }) {
  const duration = formatListenDuration(resource.duration_minutes)
  const color = light ? 'text-white/75' : 'text-[#8C7B85]'
  return (
    <div className={`flex items-center gap-3 text-[11px] font-medium ${color}`}>
      {resource.track_count != null && (
        <span className="flex items-center gap-1"><ListMusic size={12} /> {resource.track_count} {resource.track_count === 1 ? 'track' : 'tracks'}</span>
      )}
      {duration && <span className="flex items-center gap-1"><Clock size={12} /> {duration}</span>}
    </div>
  )
}

function FeaturedCard({ resource }: { resource: Resource }) {
  const playlist = isSoundCloudPlaylist(resource)

  return (
    <ResourceLink
      resource={resource}
      className="relative block rounded-[24px] overflow-hidden shadow-[0_8px_32px_rgba(50,27,38,0.18)] active:scale-[0.98] transition-transform duration-150"
    >
      {/* Blurred artwork backdrop */}
      <div className="absolute inset-0">
        <Artwork resource={resource} className="w-full h-full scale-125 blur-2xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#321B26]/85 via-[#5B1A35]/75 to-[#321B26]/90" />
      </div>

      <div className="relative z-10 p-4 flex gap-4 items-center">
        <div className="relative flex-shrink-0">
          <Artwork resource={resource} className="w-28 h-28 rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.35)]" iconSize={32} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-bold tracking-widest text-[#E6B74B] uppercase mb-1">
            {playlist ? 'Featured playlist' : 'Featured'}
          </p>
          <h3 className="text-base font-bold text-white leading-snug line-clamp-2">{resource.title}</h3>
          {resource.facilitator_name && <p className="text-xs text-white/70 mt-0.5 truncate">{resource.facilitator_name}</p>}
          <div className="mt-2"><MetaLine resource={resource} light /></div>
          <span className="mt-3 inline-flex items-center gap-1.5 pl-2 pr-3.5 py-1.5 bg-white text-[#7C2447] text-xs font-bold rounded-full">
            <span className="w-5 h-5 rounded-full bg-[#7C2447] text-white flex items-center justify-center">
              <Play size={10} fill="currentColor" />
            </span>
            {playlist ? 'Listen now' : 'Open'}
          </span>
        </div>
      </div>
    </ResourceLink>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const playlist = isSoundCloudPlaylist(resource)
  const providerKey = resource.provider.toLowerCase()
  const colors = PROVIDER_COLORS[providerKey] ?? PROVIDER_COLORS.default
  const providerLabel = PROVIDER_LABELS[providerKey] ?? resource.provider.toUpperCase()

  return (
    <ResourceLink
      resource={resource}
      className="group flex items-center gap-4 bg-white rounded-[20px] p-3 pr-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] active:scale-[0.98] transition-transform duration-150"
    >
      {/* Artwork — stacked look for playlists */}
      <div className="relative flex-shrink-0 w-[76px] h-[76px]">
        {playlist && (
          <>
            <div className="absolute inset-x-2 -top-1.5 h-full rounded-2xl bg-[#E8DDF2]" />
            <div className="absolute inset-x-1 -top-0.5 h-full rounded-2xl bg-[#D9C6E6]" />
          </>
        )}
        <Artwork resource={resource} className="relative w-full h-full rounded-2xl" />
        <span className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-full bg-white/95 text-[#7C2447] flex items-center justify-center shadow-md">
          <Play size={12} fill="currentColor" className="ml-0.5" />
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold tracking-widest inline-block mb-1 px-1.5 py-0.5 rounded" style={{ background: colors.bg, color: colors.text }}>
          {playlist ? 'PLAYLIST' : providerLabel}
        </span>
        <p className="font-semibold text-[#321B26] text-sm leading-snug line-clamp-2">{resource.title}</p>
        {resource.facilitator_name && <p className="text-[11px] text-[#8C7B85] truncate mt-0.5">{resource.facilitator_name}</p>}
        <div className="mt-1.5">
          {resource.track_count != null || resource.duration_minutes
            ? <MetaLine resource={resource} />
            : resource.description && <p className="text-[11px] text-[#8C7B85] truncate">{resource.description}</p>}
        </div>
      </div>

      {playlist
        ? <ChevronRight size={18} className="text-[#C4B5BD] flex-shrink-0" />
        : <ExternalLink size={16} className="text-[#C4B5BD] flex-shrink-0" />}
    </ResourceLink>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-8">
      <div className="w-14 h-14 rounded-full bg-[#E8DDF2] flex items-center justify-center mb-4 text-2xl">✨</div>
      <h3 className="text-[#321B26] font-semibold mb-1">Coming soon</h3>
      <p className="text-[#8C7B85] text-sm">Resources are being curated for you. Check back soon.</p>
    </div>
  )
}
