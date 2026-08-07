import { supabase } from '@/lib/supabase'
import { startOfWeek, subDays, format } from 'date-fns'
import type { MeditationSession } from '@/types/database'

export interface MeditationInsights {
  weeklyMinutes: number
  dailyAverage: number
  currentStreak: number
  longestStreak: number
  weeklyDays: { day: string; minutes: number }[]
  history: MeditationSession[]
}

export async function fetchMeditationInsights(userId: string): Promise<MeditationInsights> {
  const { data: all } = await supabase
    .from('meditation_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(200)

  const sessions = (all ?? []) as MeditationSession[]

  // Group by local date string
  const byDay = new Map<string, number>()
  for (const s of sessions) {
    if (!s.completed_at) continue
    const key = new Date(s.completed_at).toLocaleDateString('en-CA')
    byDay.set(key, (byDay.get(key) ?? 0) + s.duration_seconds)
  }

  // Weekly minutes (Mon–Sun)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  let weeklySeconds = 0
  const weeklyDays: { day: string; minutes: number }[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    const key = d.toLocaleDateString('en-CA')
    const secs = byDay.get(key) ?? 0
    weeklySeconds += secs
    weeklyDays.push({ day: format(d, 'EEE'), minutes: Math.floor(secs / 60) })
  }
  const weeklyMinutes = Math.floor(weeklySeconds / 60)

  // Daily average (over active days)
  const activeDays = byDay.size
  const totalSeconds = Array.from(byDay.values()).reduce((a, b) => a + b, 0)
  const dailyAverage = activeDays > 0 ? Math.floor(totalSeconds / activeDays / 60) : 0

  // Current streak
  let currentStreak = 0
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i)
    const key = d.toLocaleDateString('en-CA')
    if (byDay.has(key)) {
      currentStreak++
    } else if (i === 0) {
      continue
    } else {
      break
    }
  }

  // Longest streak
  const sortedDays = Array.from(byDay.keys()).sort()
  let longest = 0
  let current = 0
  let prevDate: Date | null = null
  for (const key of sortedDays) {
    const d = new Date(key)
    if (prevDate) {
      const diff = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diff === 1) {
        current++
      } else {
        current = 1
      }
    } else {
      current = 1
    }
    if (current > longest) longest = current
    prevDate = d
  }

  return {
    weeklyMinutes,
    dailyAverage,
    currentStreak,
    longestStreak: Math.max(longest, currentStreak),
    weeklyDays,
    history: sessions.slice(0, 20),
  }
}
