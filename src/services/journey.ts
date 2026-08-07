import { supabase } from '@/lib/supabase'
import type { JourneyLevel } from '@/types/database'

export interface JourneyProgress {
  levels: JourneyLevel[]
  userStats: {
    completedSessions: number
    attendedEvents: number
    meditationDays: number
    attendedRetreats: number
  }
  currentLevel: number
  nextLevel: JourneyLevel | null
}

export async function fetchJourneyProgress(userId: string): Promise<JourneyProgress> {
  // Fetch all journey levels
  const { data: levelsData } = await supabase
    .from('journey_levels')
    .select('*')
    .order('level', { ascending: true })

  const levels = (levelsData ?? []) as JourneyLevel[]

  // Completed sessions for this user
  const { count: sessionCount } = await supabase
    .from('session_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('attendance_status', 'attended')

  // Attended events
  const { count: eventCount } = await supabase
    .from('event_participants')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('attendance_status', 'attended')

  // Retreats attended (events with category = 'retreat')
  const { data: retreatData } = await supabase
    .from('event_participants')
    .select('events!inner(category)')
    .eq('user_id', userId)
    .eq('attendance_status', 'attended')

  const retreatCount = (retreatData ?? []).filter(
    (r) => {
      const event = r as { events: { category: string } }
      return event.events?.category?.toLowerCase() === 'retreat'
    }
  ).length

  // Distinct meditation days
  const { data: medData } = await supabase
    .from('meditation_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('status', 'completed')

  const medSessions = (medData ?? []) as { completed_at: string | null }[]
  const distinctDays = new Set(
    medSessions
      .filter(s => s.completed_at)
      .map(s => new Date(s.completed_at!).toLocaleDateString('en-CA'))
  ).size

  const userStats = {
    completedSessions: sessionCount ?? 0,
    attendedEvents: eventCount ?? 0,
    meditationDays: distinctDays,
    attendedRetreats: retreatCount,
  }

  // Determine current level
  let currentLevel = 1
  for (const level of levels) {
    const meetsReqs =
      userStats.completedSessions >= level.required_sessions &&
      userStats.attendedEvents >= level.required_events &&
      userStats.meditationDays >= level.required_meditation_days &&
      userStats.attendedRetreats >= level.required_retreats
    if (meetsReqs) {
      currentLevel = level.level
    } else {
      break
    }
  }

  const nextLevelData = levels.find(l => l.level === currentLevel + 1) ?? null

  return {
    levels,
    userStats,
    currentLevel,
    nextLevel: nextLevelData,
  }
}
