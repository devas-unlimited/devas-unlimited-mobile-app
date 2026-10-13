type Status = 'draft' | 'scheduled' | 'published' | 'archived' | 'cancelled' | 'available' | 'processing' | 'expired' | 'none' | 'completed' | 'scheduled' | string

const STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  published:   { bg: '#DDE9D3', text: '#2D6B4A', dot: '#2D6B4A' },
  live:        { bg: '#DDE9D3', text: '#2D6B4A', dot: '#2D6B4A' },
  hidden:      { bg: '#F7F0E9', text: '#8C7B85', dot: '#C4B5BD' },
  available:   { bg: '#DDE9D3', text: '#2D6B4A', dot: '#2D6B4A' },
  completed:   { bg: '#DDE9D3', text: '#2D6B4A', dot: '#2D6B4A' },
  draft:       { bg: '#F7F0E9', text: '#8C7B85', dot: '#C4B5BD' },
  none:        { bg: '#F7F0E9', text: '#8C7B85', dot: '#C4B5BD' },
  scheduled:   { bg: '#DDEDF1', text: '#1A6B7C', dot: '#1A6B7C' },
  processing:  { bg: '#FFF3D6', text: '#7C5C1A', dot: '#E6B74B' },
  important:   { bg: '#FFF3D6', text: '#7C5C1A', dot: '#E6B74B' },
  urgent:      { bg: '#FDECEA', text: '#C0392B', dot: '#C0392B' },
  archived:    { bg: '#F0E6F6', text: '#5B3A7C', dot: '#5B3A7C' },
  cancelled:   { bg: '#FDECEA', text: '#C0392B', dot: '#C0392B' },
  expired:     { bg: '#FDECEA', text: '#C0392B', dot: '#C0392B' },
}

const LABELS: Record<string, string> = {
  available:  'Available',
  none:       'No recording',
  processing: 'Processing',
  expired:    'Expired',
}

interface Props {
  status: Status
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: Props) {
  const style = STYLES[status] ?? { bg: '#F7F0E9', text: '#8C7B85', dot: '#C4B5BD' }
  const label = LABELS[status] ?? (status.charAt(0).toUpperCase() + status.slice(1))

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold capitalize ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'}`}
      style={{ background: style.bg, color: style.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: style.dot }} />
      {label}
    </span>
  )
}
