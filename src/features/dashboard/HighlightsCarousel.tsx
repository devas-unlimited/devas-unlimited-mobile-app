import { useEffect, useRef, useState } from 'react'
import { format } from 'date-fns'
import { MapPin, Sparkles } from 'lucide-react'
import type { Event, HomeBanner } from '@/types/database'
import type { PublishedAnnouncement } from '@/services/events'
import { BannerSlide, type BannerSlideData } from '@/components/banners/BannerSlide'

const AUTOPLAY_MS = 5000
const RESUME_AFTER_MS = 8000

type Slide = BannerSlideData & { id: string }

const fromBanner = (b: HomeBanner): Slide => ({
  id: `banner-${b.id}`,
  eyebrow: b.eyebrow,
  title: b.title,
  subtitle: b.subtitle,
  ctaLabel: b.cta_label,
  imageUrl: b.image_url,
  imageMode: b.image_mode,
  theme: b.theme,
  link: b.link_url,
})

const fromEvent = (e: Event): Slide => ({
  id: `event-${e.id}`,
  eyebrow: `${e.category} • ${e.format}`,
  title: e.title,
  meta: (
    <>
      <span>{format(new Date(e.starts_at), 'EEE, d MMM • h:mm aa')}</span>
      {e.city && <span className="flex items-center gap-1"><MapPin size={11} /> {e.city}</span>}
    </>
  ),
  ctaLabel: e.registration_url ? 'Register now' : 'View details',
  imageUrl: e.cover_image_url,
  theme: e.category === 'Retreat' ? 'lavender' : 'rose',
  link: e.registration_url || '/events',
})

const fromAnnouncement = (a: PublishedAnnouncement): Slide => ({
  id: `ann-${a.id}`,
  eyebrow: a.priority === 'normal' ? 'Announcement' : `${a.priority} • Announcement`,
  title: a.title,
  subtitle: a.short_message,
  ctaLabel: a.cta_label || 'Read more',
  imageUrl: a.cover_image_url,
  theme: 'plum',
  link: a.cta_url || '/events',
})

/**
 * Home "Highlights" slider: admin-managed banners first (in their set order),
 * then featured events/retreats and featured announcements.
 */
export function HighlightsCarousel({ banners, events, announcements }: {
  banners: HomeBanner[]
  events: Event[]
  announcements: PublishedAnnouncement[]
}) {
  const slides: Slide[] = [...banners.map(fromBanner), ...events.map(fromEvent), ...announcements.map(fromAnnouncement)]
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const [pausedUntil, setPausedUntil] = useState(0)

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(() => {
      const track = trackRef.current
      if (!track || Date.now() < pausedUntil) return
      const next = (Math.round(track.scrollLeft / track.clientWidth) + 1) % slides.length
      track.scrollTo({ left: next * track.clientWidth, behavior: 'smooth' })
    }, AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [slides.length, pausedUntil])

  if (slides.length === 0) return null

  const pause = () => setPausedUntil(Date.now() + RESUME_AFTER_MS)
  const goTo = (i: number) => {
    pause()
    trackRef.current?.scrollTo({ left: i * trackRef.current.clientWidth, behavior: 'smooth' })
  }

  return (
    <section aria-roledescription="carousel" aria-label="Highlights">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-[#7C2447]" />
        <h2 className="text-sm font-bold text-[#321B26]">Highlights</h2>
      </div>

      <div
        ref={trackRef}
        onScroll={e => setActive(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        onPointerDown={pause}
        onTouchStart={pause}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-[24px]"
      >
        {slides.map((s, i) => (
          <div key={s.id} className="w-full flex-shrink-0 snap-center" aria-roledescription="slide" aria-label={`${i + 1} of ${slides.length}`}>
            <BannerSlide data={s} />
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {slides.map((s, i) => (
            <button
              key={s.id}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={active === i}
              className={`h-1.5 rounded-full transition-all duration-300 ${active === i ? 'w-5 bg-[#7C2447]' : 'w-1.5 bg-[#D9C6D0]'}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
