import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExternalLink, Play, Headphones, Sunrise, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchResources } from '@/services/sanctuary'
import type { Resource } from '@/types/database'

const FILTERS = [
  { id: 'All', label: 'All' },
  { id: 'watch', label: 'Watch' },
  { id: 'listen', label: 'Listen' },
  { id: 'meditate', label: 'Meditate' },
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

function getCategoryIcon(category: string) {
  switch (category) {
    case 'watch': return <Play size={16} />
    case 'listen': return <Headphones size={16} />
    case 'meditate': return <Sunrise size={16} />
    default: return <Play size={16} />
  }
}

export function SanctuaryPage() {
  const [activeFilter, setActiveFilter] = useState('All')

  const { data: resources = [], isLoading, error, refetch } = useQuery({
    queryKey: ['resources', activeFilter],
    queryFn: () => fetchResources(activeFilter === 'All' ? undefined : activeFilter),
    staleTime: 1000 * 60 * 5,
  })

  const featured = resources.find(r => r.is_featured)
  const regular = resources.filter(r => !r.is_featured)

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
            <span className="inline-block px-4 py-2 bg-white/15 border border-white/25 text-white text-xs font-semibold rounded-full">
              Start exploring
            </span>
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
            {f.id !== 'All' && getCategoryIcon(f.id)}
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="px-5 space-y-4">
          <Skeleton className="h-52 w-full" />
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
      ) : (
        <div className="px-5 pb-6 space-y-5">
          {/* Featured */}
          {featured && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-[#321B26]">Featured for you</h2>
                <button className="text-xs text-[#7C2447] font-semibold flex items-center gap-0.5">
                  See all <ChevronRight size={14} />
                </button>
              </div>
              <FeaturedCard resource={featured} />
            </div>
          )}

          {/* Regular list */}
          {regular.length > 0 && (
            <div className="space-y-3">
              {regular.map(r => <ResourceCard key={r.id} resource={r} />)}
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}

function FeaturedCard({ resource }: { resource: Resource }) {
  const providerKey = resource.provider.toLowerCase()
  const colors = PROVIDER_COLORS[providerKey] ?? PROVIDER_COLORS.default
  const providerLabel = PROVIDER_LABELS[providerKey] ?? resource.provider.toUpperCase()

  return (
    <a
      href={resource.external_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-[20px] overflow-hidden bg-white shadow-[0_4px_24px_rgba(50,27,38,0.10)] active:scale-[0.98] transition-transform duration-150"
      aria-label={`Open ${resource.title} on ${resource.provider}`}
    >
      {resource.thumbnail_url ? (
        <div className="w-full aspect-[16/9] bg-[#F7F0E9] relative overflow-hidden">
          <img
            src={resource.thumbnail_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className="text-[9px] font-bold tracking-widest px-2 py-1 rounded-full" style={{ background: colors.bg, color: colors.text }}>
              {providerLabel}
            </span>
          </div>
        </div>
      ) : (
        <div className="w-full h-32 flex items-center justify-center" style={{ background: colors.bg }}>
          {getCategoryIcon(resource.category)}
        </div>
      )}
      <div className="p-4">
        <p className="font-semibold text-[#321B26] text-sm mb-1">{resource.title}</p>
        <p className="text-xs text-[#8C7B85]">
          {resource.duration_minutes ? `${resource.duration_minutes} min` : ''}{resource.description ? ` • ${resource.description}` : ''}
        </p>
      </div>
    </a>
  )
}

function ResourceCard({ resource }: { resource: Resource }) {
  const providerKey = resource.provider.toLowerCase()
  const colors = PROVIDER_COLORS[providerKey] ?? PROVIDER_COLORS.default
  const providerLabel = PROVIDER_LABELS[providerKey] ?? resource.provider.toUpperCase()

  return (
    <a
      href={resource.external_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)] active:scale-[0.98] transition-transform duration-150"
      aria-label={`Open ${resource.title} on ${resource.provider}`}
    >
      {/* Thumbnail or icon */}
      <div className="w-14 h-14 rounded-xl flex-shrink-0 overflow-hidden" style={{ background: colors.bg }}>
        {resource.thumbnail_url ? (
          <img src={resource.thumbnail_url} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: colors.text }}>
            {getCategoryIcon(resource.category)}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-bold tracking-widest inline-block mb-1 px-1.5 py-0.5 rounded" style={{ background: colors.bg, color: colors.text }}>
          {providerLabel}
        </span>
        <p className="font-semibold text-[#321B26] text-sm truncate">{resource.title}</p>
        <p className="text-xs text-[#8C7B85]">
          {[resource.duration_minutes ? `${resource.duration_minutes} min` : null, resource.description].filter(Boolean).join(' • ')}
        </p>
      </div>

      <ExternalLink size={16} className="text-[#C4B5BD] flex-shrink-0" />
    </a>
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
