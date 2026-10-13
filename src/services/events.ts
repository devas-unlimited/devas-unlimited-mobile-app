import { supabase } from '@/lib/supabase'
import type { Announcement, Event } from '@/types/database'

/** Shared with the admin panel — keep in sync with migration 006 constraints */
export const EVENT_CATEGORIES = ['Event', 'Retreat'] as const
export const EVENT_FORMATS = ['In-person', 'Online', 'Hybrid'] as const
export type EventCategory = typeof EVENT_CATEGORIES[number]

/** Published events — upcoming first (soonest on top), then past (most recent first) */
export async function fetchEvents(category?: EventCategory): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('starts_at', { ascending: true })
    .limit(100)

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) throw error
  const events = (data ?? []) as Event[]
  const now = Date.now()
  const isUpcoming = (e: Event) => new Date(e.ends_at ?? e.starts_at).getTime() >= now
  return [...events.filter(isUpcoming), ...events.filter(e => !isUpcoming(e)).reverse()]
}

export type PublishedAnnouncement = Pick<Announcement,
  'id' | 'title' | 'short_message' | 'full_content' | 'type' | 'priority' | 'is_featured' | 'is_dismissible' | 'cover_image_url' | 'cta_label' | 'cta_url' | 'published_at' | 'expires_at'>

/** Featured upcoming events/retreats — shown as Home highlight banners */
export async function fetchFeaturedEvents(limit = 5): Promise<Event[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .eq('is_featured', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as Event[]
}

/** Live announcements: published, publish time reached, not expired */
export async function fetchPublishedAnnouncements(limit = 50): Promise<PublishedAnnouncement[]> {
  const now = new Date().toISOString()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('announcements') as any)
    .select('id, title, short_message, full_content, type, priority, is_featured, is_dismissible, cover_image_url, cta_label, cta_url, published_at, expires_at')
    .eq('status', 'published')
    .or(`published_at.is.null,published_at.lte.${now}`)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return (data ?? []) as PublishedAnnouncement[]
}
