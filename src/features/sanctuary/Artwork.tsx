import { useState } from 'react'
import { Play, Headphones, Sunrise } from 'lucide-react'
import type { Resource } from '@/types/database'
import { resourceThumbnail } from '@/services/sanctuary'

export function CategoryIcon({ category, size = 16 }: { category: string; size?: number }) {
  switch (category) {
    case 'listen': return <Headphones size={size} />
    case 'meditate': return <Sunrise size={size} />
    default: return <Play size={size} />
  }
}

export function Artwork({ resource, className, iconSize = 22 }: { resource: Pick<Resource, 'thumbnail_url' | 'external_url' | 'category'>; className?: string; iconSize?: number }) {
  const [failed, setFailed] = useState(false)
  const src = resourceThumbnail(resource)
  if (src && !failed) {
    return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className ?? ''}`} />
  }
  return (
    <div
      className={`flex items-center justify-center text-white/90 ${className ?? ''}`}
      style={{ background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)' }}
    >
      <CategoryIcon category={resource.category} size={iconSize} />
    </div>
  )
}
