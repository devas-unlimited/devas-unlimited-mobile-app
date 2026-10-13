import { useState } from 'react'
import { formatDistanceToNowStrict } from 'date-fns'
import { Play, Clock, Share2, ChevronDown, Sparkles } from 'lucide-react'
import { useToast } from '@/components/feedback/Toast'
import { formatListenDuration, youtubeWatchUrl } from '@/services/sanctuary'
import type { Resource } from '@/types/database'
import { Artwork } from './Artwork'

/** YouTube's play-button mark (lucide no longer ships brand icons) */
export function YouTubeIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 0.7} viewBox="0 0 28 20" className={className} aria-hidden="true">
      <path fill="#FF0000" d="M27.4 3.1A3.5 3.5 0 0 0 24.9.6C22.8 0 14 0 14 0S5.2 0 3.1.6A3.5 3.5 0 0 0 .6 3.1C0 5.3 0 10 0 10s0 4.7.6 6.9a3.5 3.5 0 0 0 2.5 2.5C5.2 20 14 20 14 20s8.8 0 10.9-.6a3.5 3.5 0 0 0 2.5-2.5c.6-2.2.6-6.9.6-6.9s0-4.7-.6-6.9Z" />
      <path fill="#fff" d="m11.2 14.3 7.3-4.3-7.3-4.3v8.6Z" />
    </svg>
  )
}

function relativeDate(iso: string | null) {
  return iso ? formatDistanceToNowStrict(new Date(iso), { addSuffix: true }) : null
}

function topicOf(resource: Resource) {
  return resource.tags?.[0] ?? null
}

/** Opens the video on YouTube itself, so every play counts as a channel view */
function WatchLink({ resource, className, children, label }: { resource: Resource; className: string; children: React.ReactNode; label?: string }) {
  return (
    <a
      href={youtubeWatchUrl(resource)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={label ?? `Watch ${resource.title} on YouTube`}
    >
      {children}
    </a>
  )
}

function Thumbnail({ resource, featured = false, playSize = 'lg' }: { resource: Resource; featured?: boolean; playSize?: 'lg' | 'sm' }) {
  const duration = formatListenDuration(resource.duration_minutes)
  const topic = topicOf(resource)
  return (
    <div className="relative aspect-video overflow-hidden bg-[#321B26]">
      <Artwork resource={resource} className="absolute inset-0 w-full h-full group-hover:scale-[1.03] transition-transform duration-500" iconSize={32} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

      {featured ? (
        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E6B74B] text-[#321B26] text-[10px] font-bold tracking-wider uppercase shadow">
          <Sparkles size={11} /> Featured
        </span>
      ) : topic && playSize === 'lg' && (
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[#7C2447] text-[10px] font-bold tracking-wider uppercase">
          {topic}
        </span>
      )}

      <span className="absolute inset-0 flex items-center justify-center">
        <span
          className={`rounded-full bg-white/95 text-[#7C2447] flex items-center justify-center shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-white/25 group-active:scale-90 transition-transform ${
            playSize === 'lg' ? 'w-16 h-16 ring-8' : 'w-10 h-10 ring-4'
          }`}
        >
          <Play size={playSize === 'lg' ? 24 : 15} fill="currentColor" className="ml-1" />
        </span>
      </span>

      {duration && (
        <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-semibold">
          <Clock size={10} /> {duration}
        </span>
      )}
    </div>
  )
}

/** Full video card with description preview, read more and watch/share actions */
export function VideoCard({ resource, featured = false }: { resource: Resource; featured?: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()
  const description = resource.description?.trim() ?? ''
  const canExpand = description.length > 160 || description.split('\n').length > 3
  const date = relativeDate(resource.published_at)
  const topic = topicOf(resource)
  const dark = featured

  async function share() {
    const url = youtubeWatchUrl(resource)
    try {
      if (navigator.share) await navigator.share({ title: resource.title, url })
      else {
        await navigator.clipboard.writeText(url)
        toast('Video link copied', 'success')
      }
    } catch {
      // User closed the share sheet
    }
  }

  return (
    <article
      className={`rounded-[24px] overflow-hidden ${
        dark ? 'bg-[#321B26] shadow-[0_10px_36px_rgba(50,27,38,0.28)]' : 'bg-white shadow-[0_2px_16px_rgba(50,27,38,0.07)]'
      }`}
    >
      <WatchLink resource={resource} className="group block">
        <Thumbnail resource={resource} featured={featured} />
      </WatchLink>

      <div className="p-4">
        <div className={`flex items-center gap-1.5 text-[11px] font-medium mb-1.5 ${dark ? 'text-white/55' : 'text-[#8C7B85]'}`}>
          {featured && topic && <span className="text-[#E6B74B] font-bold uppercase tracking-wider text-[10px]">{topic}</span>}
          {featured && topic && (resource.facilitator_name || date) && <span aria-hidden="true">•</span>}
          {resource.facilitator_name && <span className="truncate">{resource.facilitator_name}</span>}
          {resource.facilitator_name && date && <span aria-hidden="true">•</span>}
          {date && <span className="flex-shrink-0">{date}</span>}
        </div>

        <WatchLink resource={resource} className="block">
          <h3 className={`font-bold leading-snug ${dark ? 'text-white text-[17px]' : 'text-[#321B26] text-[15px]'}`}>{resource.title}</h3>
        </WatchLink>

        {description && (
          <div className="mt-2">
            <p
              className={`text-[13px] leading-relaxed whitespace-pre-line ${dark ? 'text-white/75' : 'text-[#5E4A55]'} ${
                expanded ? '' : 'line-clamp-3'
              }`}
            >
              {description}
            </p>
            {canExpand && (
              <button
                type="button"
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${dark ? 'text-[#E6B74B]' : 'text-[#7C2447]'}`}
              >
                {expanded ? 'Show less' : 'Read more'}
                <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <WatchLink
            resource={resource}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-bold active:scale-[0.98] transition-transform ${
              dark ? 'bg-white text-[#321B26]' : 'bg-[#7C2447] text-white'
            }`}
          >
            <YouTubeIcon size={18} />
            Watch on YouTube
          </WatchLink>
          <button
            type="button"
            onClick={share}
            aria-label={`Share ${resource.title}`}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform ${
              dark ? 'bg-white/10 text-white border border-white/20' : 'bg-[#F7F0E9] text-[#7C2447]'
            }`}
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

/** Compact tile for horizontal rows */
export function VideoTile({ resource }: { resource: Resource }) {
  const date = relativeDate(resource.published_at)
  return (
    <WatchLink resource={resource} className="group block w-[248px] flex-shrink-0 snap-start active:scale-[0.98] transition-transform">
      <div className="rounded-2xl overflow-hidden shadow-[0_4px_18px_rgba(50,27,38,0.12)]">
        <Thumbnail resource={resource} playSize="sm" />
      </div>
      <div className="pt-2.5 px-0.5">
        <p className="text-[13px] font-semibold text-[#321B26] leading-snug line-clamp-2">{resource.title}</p>
        <p className="text-[11px] text-[#8C7B85] mt-1 truncate">
          {[resource.facilitator_name, date].filter(Boolean).join(' • ')}
        </p>
      </div>
    </WatchLink>
  )
}
