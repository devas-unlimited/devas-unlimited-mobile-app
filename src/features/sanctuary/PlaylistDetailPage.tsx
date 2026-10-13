import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ExternalLink, ListMusic, Clock, User } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchResourceById, soundCloudEmbedUrl, formatListenDuration, isSoundCloudPlaylist } from '@/services/sanctuary'
import { Artwork } from './Artwork'

export function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [playerLoaded, setPlayerLoaded] = useState(false)

  const { data: resource, isLoading, error } = useQuery({
    queryKey: ['sanctuary', 'resource', id],
    queryFn: () => fetchResourceById(id!),
    enabled: Boolean(id),
  })

  const duration = resource ? formatListenDuration(resource.duration_minutes) : null
  // Size the player to fit the tracklist (SoundCloud scrolls internally beyond this)
  const playerHeight = Math.min(470, Math.max(300, 170 + (resource?.track_count ?? 6) * 38))

  return (
    <AppShell>
      {isLoading ? (
        <div className="px-5 pt-8 space-y-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-52 w-52 mx-auto rounded-3xl" />
          <Skeleton className="h-6 w-2/3 mx-auto" />
          <Skeleton className="h-80 w-full" />
        </div>
      ) : error || !resource ? (
        <div className="px-5 py-24 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't find this playlist.</p>
          <button onClick={() => navigate('/sanctuary')} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">
            Back to Sanctuary
          </button>
        </div>
      ) : (
        <>
          {/* Hero with blurred artwork backdrop */}
          <div className="relative overflow-hidden rounded-b-[32px]">
            <div className="absolute inset-0">
              <Artwork resource={resource} className="w-full h-full scale-150 blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#321B26]/70 via-[#5B1A35]/80 to-[#321B26]/95" />
            </div>

            <div className="relative z-10 px-5 pt-8 pb-7">
              <button
                onClick={() => navigate(-1)}
                aria-label="Go back"
                className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <Artwork resource={resource} className="w-52 h-52 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.45)]" iconSize={48} />
                <p className="text-[10px] font-bold tracking-widest text-[#E6B74B] uppercase mt-5 mb-1">Playlist</p>
                <h1 className="text-xl font-bold text-white leading-snug px-2">{resource.title}</h1>
                {resource.facilitator_name && (
                  <p className="flex items-center gap-1.5 text-sm text-white/75 mt-1">
                    <User size={13} /> {resource.facilitator_name}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs font-medium text-white/80">
                  {resource.track_count != null && (
                    <span className="flex items-center gap-1.5"><ListMusic size={14} /> {resource.track_count} {resource.track_count === 1 ? 'track' : 'tracks'}</span>
                  )}
                  {duration && <span className="flex items-center gap-1.5"><Clock size={14} /> {duration}</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-5 space-y-4">
            {resource.description && (
              <p className="text-sm text-[#4A3540] leading-relaxed">{resource.description}</p>
            )}

            {/* Tracklist + player */}
            {isSoundCloudPlaylist(resource) && (
              <section className="bg-white rounded-[20px] p-3 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
                <div className="flex items-center justify-between px-1 pt-1 pb-3">
                  <h2 className="text-sm font-bold text-[#321B26]">All tracks</h2>
                  <span className="text-[11px] text-[#8C7B85]">Tap a track to play</span>
                </div>
                <div className="relative rounded-xl overflow-hidden" style={{ height: playerHeight }}>
                  {!playerLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
                  <iframe
                    title={`${resource.title} — SoundCloud player`}
                    src={soundCloudEmbedUrl(resource.external_url)}
                    width="100%"
                    height={playerHeight}
                    allow="autoplay; encrypted-media"
                    loading="lazy"
                    onLoad={() => setPlayerLoaded(true)}
                    className={`relative border-0 transition-opacity duration-300 ${playerLoaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
              </section>
            )}

            <a
              href={resource.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-white border border-[#E8DDF2] text-[#7C2447] rounded-full text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <ExternalLink size={16} />
              Open in SoundCloud
            </a>
          </div>
        </>
      )}
    </AppShell>
  )
}
