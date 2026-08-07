import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'

export async function fetchEvents(category?: string): Promise<Event[]> {
  let query = supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('starts_at', { ascending: true })
    .limit(50)

  if (category && category !== 'All') {
    query = query.ilike('category', category)
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Event[]
}
