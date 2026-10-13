import { useState } from 'react'
import { format } from 'date-fns'
import { X, ExternalLink, ChevronDown } from 'lucide-react'
import type { PublishedAnnouncement } from '@/services/events'

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#FDECEA',
  important: '#FFF3D6',
  normal: '#F0F7FF',
}

const PRIORITY_TEXT: Record<string, string> = {
  urgent: '#C0392B',
  important: '#8B6914',
  normal: '#1A6B7C',
}

export function AnnouncementCard({ announcement: a, onDismiss, showDate = false }: {
  announcement: PublishedAnnouncement
  onDismiss?: () => void
  showDate?: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const bg = PRIORITY_COLORS[a.priority] ?? PRIORITY_COLORS.normal
  const textColor = PRIORITY_TEXT[a.priority] ?? PRIORITY_TEXT.normal
  const hasMore = Boolean(a.full_content && a.full_content.trim())

  return (
    <div className="rounded-[20px] p-4 shadow-[0_2px_12px_rgba(50,27,38,0.06)]" style={{ background: bg }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            {a.priority !== 'normal' && (
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: textColor }}>{a.priority}</span>
            )}
            <p className="text-sm font-semibold text-[#321B26] leading-snug">{a.title}</p>
          </div>
          {showDate && a.published_at && (
            <p className="text-[10px] text-[#8C7B85] mb-1">{format(new Date(a.published_at), 'd MMM yyyy')}</p>
          )}
          <p className="text-xs text-[#4A3540] leading-relaxed">{a.short_message}</p>
          {expanded && hasMore && (
            <p className="text-xs text-[#4A3540] mt-2 leading-relaxed border-t border-black/10 pt-2 whitespace-pre-line">{a.full_content}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {hasMore && (
              <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: textColor }}>
                {expanded ? 'Show less' : 'Read more'}
                <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            {a.cta_label && a.cta_url && (
              <a href={a.cta_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: textColor }}>
                {a.cta_label} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        {onDismiss && a.is_dismissible && (
          <button onClick={onDismiss} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 text-[#8C7B85] hover:bg-black/20 transition-colors" aria-label="Dismiss">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
