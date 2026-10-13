import { supabase } from '@/lib/supabase'
import type { JourneyLevel } from '@/types/database'

export interface JourneyStats {
  completedSessions: number
  attendedEvents: number
  meditationDays: number
  attendedRetreats: number
}

export interface JourneyProgress {
  levels: JourneyLevel[]
  userStats: JourneyStats
  currentLevel: number
  nextLevel: JourneyLevel | null
  /** True once the final level is reached — the journey is well done */
  isComplete: boolean
  /** How many full journeys this user has completed before the current one */
  completedJourneys: number
  /** Start of the current journey (latest completion), null for the first journey */
  journeyStartedAt: string | null
}

type LevelRequirements = Pick<JourneyLevel, 'level' | 'required_sessions' | 'required_events' | 'required_meditation_days' | 'required_retreats'>

export function meetsRequirements(level: LevelRequirements, stats: JourneyStats) {
  return (
    stats.completedSessions >= level.required_sessions &&
    stats.attendedEvents >= level.required_events &&
    stats.meditationDays >= level.required_meditation_days &&
    stats.attendedRetreats >= level.required_retreats
  )
}

/** Levels must be unlocked in order — the first unmet level stops progression */
export function calculateCurrentLevel(levels: LevelRequirements[], stats: JourneyStats): number {
  let current = 1
  for (const level of [...levels].sort((a, b) => a.level - b.level)) {
    if (!meetsRequirements(level, stats)) break
    current = level.level
  }
  return current
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export function formatLevelRequirements(level: LevelRequirements): string {
  const parts = [
    level.required_sessions > 0 ? plural(level.required_sessions, 'session') : null,
    level.required_events > 0 ? plural(level.required_events, 'event') : null,
    level.required_meditation_days > 0 ? `${level.required_meditation_days} meditation ${level.required_meditation_days === 1 ? 'day' : 'days'}` : null,
    level.required_retreats > 0 ? plural(level.required_retreats, 'retreat') : null,
  ].filter(Boolean)
  return parts.join(' • ') || 'Create your account'
}

export async function fetchJourneyProgress(userId: string): Promise<JourneyProgress> {
  const [levelsRes, completionsRes] = await Promise.all([
    supabase.from('journey_levels').select('*').order('level', { ascending: true }),
    supabase.from('journey_completions').select('completed_at').eq('user_id', userId).order('completed_at', { ascending: false }),
  ])
  if (levelsRes.error) throw levelsRes.error

  const levels = (levelsRes.data ?? []) as JourneyLevel[]
  const completions = (completionsRes.data ?? []) as { completed_at: string }[]
  const since = completions[0]?.completed_at ?? null
  const isAfterStart = (date: string | null | undefined) => !since || (!!date && date > since)

  // Sessions the user attended that have actually taken place
  let sessionsQuery = supabase
    .from('session_participants')
    .select('client_sessions!inner(status, starts_at)', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('attendance_status', 'attended')
    .eq('client_sessions.status', 'completed')
  if (since) sessionsQuery = sessionsQuery.gt('client_sessions.starts_at', since)

  const [sessionsRes, eventsRes, meditationRes] = await Promise.all([
    sessionsQuery,
    supabase
      .from('event_participants')
      .select('attended_at, events!inner(category, starts_at)')
      .eq('user_id', userId)
      .eq('attendance_status', 'attended'),
    supabase
      .from('meditation_sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gt('completed_at', since ?? '1970-01-01'),
  ])

  type EventRow = { attended_at: string | null; events: { category: string; starts_at: string } | null }
  const attended = ((eventsRes.data ?? []) as unknown as EventRow[])
    .filter(e => isAfterStart(e.attended_at ?? e.events?.starts_at))

  const meditationDays = new Set(
    ((meditationRes.data ?? []) as { completed_at: string | null }[])
      .filter(s => s.completed_at)
      .map(s => new Date(s.completed_at!).toLocaleDateString('en-CA'))
  ).size

  const userStats: JourneyStats = {
    completedSessions: sessionsRes.count ?? 0,
    attendedEvents: attended.length,
    meditationDays,
    attendedRetreats: attended.filter(e => e.events?.category?.toLowerCase() === 'retreat').length,
  }

  const currentLevel = calculateCurrentLevel(levels, userStats)
  const finalLevel = levels.length ? levels[levels.length - 1].level : 1

  return {
    levels,
    userStats,
    currentLevel,
    nextLevel: levels.find(l => l.level === currentLevel + 1) ?? null,
    isComplete: levels.length > 1 && currentLevel === finalLevel,
    completedJourneys: completions.length,
    journeyStartedAt: since,
  }
}

/** Records the completed journey — progress restarts from activity after this moment */
export async function startNewJourney(userId: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('journey_completions') as any).insert({ user_id: userId })
  if (error) throw error
}
