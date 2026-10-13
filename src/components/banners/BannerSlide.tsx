import { Link } from 'react-router-dom'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import type { BannerImageMode, BannerTheme } from '@/types/database'
import { BANNER_THEMES, isExternalLink } from '@/services/banners'

export interface BannerSlideData {
  eyebrow?: string | null
  title: string
  subtitle?: string | null
  meta?: React.ReactNode
  ctaLabel?: string | null
  imageUrl?: string | null
  imageMode?: BannerImageMode
  theme?: BannerTheme
  /** https://… opens a new tab, /path navigates in-app, empty = not clickable */
  link?: string | null
}

/** One Home highlight banner — shared by the client slider and the admin live preview */
export function BannerSlide({ data, preview = false }: { data: BannerSlideData; preview?: boolean }) {
  const theme = BANNER_THEMES[data.theme ?? 'plum'] ?? BANNER_THEMES.plum
  const cover = data.imageMode !== 'side' && Boolean(data.imageUrl)
  const side = data.imageMode === 'side' && Boolean(data.imageUrl)
  const light = !cover && !theme.dark
  const external = Boolean(data.link && isExternalLink(data.link))

  const style = {
    background: cover
      ? `linear-gradient(180deg, rgba(50,27,38,0.10) 0%, rgba(50,27,38,0.88) 100%), url("${data.imageUrl}") center/cover`
      : theme.background,
  }

  const content = (
    <div className={`flex w-full p-5 gap-3 ${side ? 'items-center' : 'flex-col justify-end'}`}>
      {!cover && !side && <div className={`absolute -top-10 -right-10 w-36 h-36 rounded-full ${light ? 'bg-white/50' : 'bg-white/10'}`} aria-hidden="true" />}
      <div className="relative flex-1 min-w-0">
        {data.eyebrow && (
          <p className={`text-[10px] font-bold tracking-widest uppercase mb-1 ${light ? 'text-[#E07A8B]' : 'text-[#E6B74B]'}`}>{data.eyebrow}</p>
        )}
        <h3 className={`text-lg font-bold leading-snug line-clamp-2 ${light ? 'text-[#4A2338]' : 'text-white'}`}>{data.title || 'Banner title'}</h3>
        {data.subtitle && (
          <p className={`text-xs mt-0.5 leading-relaxed line-clamp-2 ${light ? 'text-[#7A5466]' : 'text-white/75'}`}>{data.subtitle}</p>
        )}
        {data.meta && <div className="flex items-center gap-3 text-xs text-white/75 mt-1 flex-wrap">{data.meta}</div>}
        {data.ctaLabel && (
          <span className={`mt-3 inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold rounded-full ${light ? 'bg-[#4A2338] text-white' : 'bg-white text-[#7C2447]'}`}>
            {data.ctaLabel} {external ? <ArrowUpRight size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
      </div>
      {side && <img src={data.imageUrl!} alt="" className="relative w-28 max-h-32 flex-shrink-0 object-contain" loading="lazy" />}
    </div>
  )

  const className = `relative flex h-44 rounded-[24px] overflow-hidden ${!preview && data.link ? 'active:scale-[0.99] transition-transform' : ''}`

  if (preview || !data.link) return <div className={className} style={style}>{content}</div>
  if (external) return <a href={data.link} target="_blank" rel="noopener noreferrer" className={className} style={style}>{content}</a>
  return <Link to={data.link} className={className} style={style}>{content}</Link>
}
