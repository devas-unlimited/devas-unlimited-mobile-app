import { supabase } from '@/lib/supabase'
import type { Event } from '@/types/database'
import { startOfDay, startOfWeek, endOfDay } from 'date-fns'
import { fetchPublishedAnnouncements } from './events'

export interface DashboardStats {
  minutesToday: number
  dayStreak: number
  totalMinutes: number
}

export async function fetchDashboardStats(userId: string): Promise<DashboardStats> {
  const todayStart = startOfDay(new Date()).toISOString()
  const todayEnd = endOfDay(new Date()).toISOString()

  type MedRow = { duration_seconds: number; completed_at: string | null }

  const { data: todayRaw } = await supabase
    .from('meditation_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', todayStart)
    .lte('completed_at', todayEnd)
  const todayData = (todayRaw ?? []) as MedRow[]

  const minutesToday = Math.floor(
    todayData.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60
  )

  const { data: allRaw } = await supabase
    .from('meditation_sessions')
    .select('completed_at, duration_seconds')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })

  const sessions = (allRaw ?? []) as MedRow[]
  const totalMinutes = Math.floor(
    sessions.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60
  )

  // Calculate streak
  const distinctDays = new Set(
    sessions
      .filter(s => s.completed_at)
      .map(s => new Date(s.completed_at!).toLocaleDateString('en-CA'))
  )

  let streak = 0
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-CA')
    if (distinctDays.has(key)) {
      streak++
    } else if (i === 0) {
      // today not meditated, check yesterday
      continue
    } else {
      break
    }
  }

  return { minutesToday, dayStreak: streak, totalMinutes }
}

export async function fetchFeaturedEvent(): Promise<Event | null> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_featured', true)
    .eq('is_published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data as Event | null
}

export async function fetchNextEvent(): Promise<Event | null> {
  const { data } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data as Event | null
}

export async function fetchActiveAnnouncements(userId: string) {
  const data = await fetchPublishedAnnouncements(5)

  // Filter out ones this user has already dismissed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reads } = await (supabase.from('announcement_reads') as any)
    .select('announcement_id')
    .eq('user_id', userId)
    .not('dismissed_at', 'is', null)

  const dismissedIds = new Set(((reads ?? []) as { announcement_id: string }[]).map(r => r.announcement_id))
  return data.filter(a => !dismissedIds.has(a.id))
}

export async function dismissAnnouncement(userId: string, announcementId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('announcement_reads') as any)
    .upsert({ user_id: userId, announcement_id: announcementId, dismissed_at: new Date().toISOString() })
}

export async function fetchWeeklyMeditationMinutes(userId: string): Promise<number> {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString()
  const { data } = await supabase
    .from('meditation_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', weekStart)
  const rows = (data ?? []) as { duration_seconds: number }[]
  return Math.floor(rows.reduce((sum, s) => sum + (s.duration_seconds ?? 0), 0) / 60)
}
