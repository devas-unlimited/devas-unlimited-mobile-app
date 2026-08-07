import { supabase } from '@/lib/supabase'
import type { Resource } from '@/types/database'

export async function fetchResources(category?: string): Promise<Resource[]> {
  let query = supabase
    .from('resources')
    .select('*')
    .eq('is_published', true)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(50)

  if (category && category !== 'All') {
    query = query.eq('category', category.toLowerCase())
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Resource[]
}
