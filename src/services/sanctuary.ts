import { supabase } from '@/lib/supabase'
import type { Resource } from '@/types/database'

export async function fetchResources(category?: string): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('display_order', { ascending: true })
    .order('published_at', { ascending: false })
    .limit(200)

  if (category && category !== 'All') {
    query = query.eq('category', category.toLowerCase())
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Resource[]
}

export async function fetchResourceById(id: string): Promise<Resource | null> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  return data as Resource | null
}

export function isSoundCloudPlaylist(resource: Pick<Resource, 'provider' | 'external_url'>) {
  return resource.provider.toLowerCase() === 'soundcloud' && /soundcloud\.com\/.+\/sets\//.test(resource.external_url)
}

export function soundCloudEmbedUrl(url: string) {
  const params = new URLSearchParams({
    url,
    color: '#7c2447',
    auto_play: 'false',
    hide_related: 'true',
    show_comments: 'false',
    show_user: 'true',
    show_reposts: 'false',
    show_teaser: 'false',
    visual: 'false',
  })
  return `https://w.soundcloud.com/player/?${params.toString()}`
}

/** Extracts the 11-character video ID from any common YouTube link format */
export function youtubeId(url: string | null | undefined): string | null {
  if (!url) return null
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([\w-]{11})/)
  return m ? m[1] : null
}

export function isYouTubeVideo(resource: Pick<Resource, 'provider' | 'external_url'>) {
  return youtubeId(resource.external_url) !== null
}

/** Canonical watch link — opens the YouTube app on phones, youtube.com elsewhere */
export function youtubeWatchUrl(resource: Pick<Resource, 'external_url'>) {
  const id = youtubeId(resource.external_url)
  return id ? `https://www.youtube.com/watch?v=${id}` : resource.external_url
}

export function youtubeThumbnail(id: string, quality: 'maxresdefault' | 'hqdefault' = 'hqdefault') {
  return `https://i.ytimg.com/vi/${id}/${quality}.jpg`
}

/** Uses the saved thumbnail, or YouTube's own for video links without one */
export function resourceThumbnail(resource: Pick<Resource, 'thumbnail_url' | 'external_url'>) {
  if (resource.thumbnail_url) return resource.thumbnail_url
  const id = youtubeId(resource.external_url)
  return id ? youtubeThumbnail(id) : null
}

/** Picks the sharpest thumbnail YouTube has (maxres isn't generated for every video) */
export function bestYouTubeThumbnail(id: string): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    // YouTube serves a 120px placeholder when maxres doesn't exist
    img.onload = () => resolve(img.naturalWidth > 120 ? img.src : youtubeThumbnail(id))
    img.onerror = () => resolve(youtubeThumbnail(id))
    img.src = youtubeThumbnail(id, 'maxresdefault')
  })
}

export interface YouTubeDetails {
  title: string
  author: string
  thumbnailUrl: string
}

/** Title, channel and thumbnail for a YouTube link (oEmbed allows browser requests) */
export async function fetchYouTubeDetails(url: string): Promise<YouTubeDetails> {
  const id = youtubeId(url)
  if (!id) throw new Error('That doesn’t look like a YouTube video link')
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`)
  if (!res.ok) throw new Error(res.status === 401 || res.status === 403 ? 'This video is private or can’t be shared' : 'Video not found on YouTube')
  const data = (await res.json()) as { title: string; author_name: string }
  return { title: data.title, author: data.author_name, thumbnailUrl: await bestYouTubeThumbnail(id) }
}

export function formatListenDuration(minutes: number | null) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h} hr ${m} min` : `${h} hr`
}
