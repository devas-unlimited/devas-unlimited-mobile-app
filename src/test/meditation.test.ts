import { describe, it, expect } from 'vitest'

// ─── Streak calculation ───────────────────────────────────────────────────────
function calculateStreak(dates: string[]): number {
  const set = new Set(dates)
  const now = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toLocaleDateString('en-CA')
    if (set.has(key)) {
      streak++
    } else if (i === 0) {
      continue
    } else {
      break
    }
  }
  return streak
}

function calculateLongestStreak(sortedDates: string[]): number {
  if (sortedDates.length === 0) return 0
  let longest = 1
  let current = 1
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1])
    const curr = new Date(sortedDates[i])
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 1) {
      current++
      if (current > longest) longest = current
    } else {
      current = 1
    }
  }
  return longest
}

function weeklyTotal(sessions: { completed_at: string; duration_seconds: number }[], weekStart: Date): number {
  const start = weekStart.getTime()
  const end = start + 7 * 24 * 60 * 60 * 1000
  const seconds = sessions
    .filter(s => {
      const t = new Date(s.completed_at).getTime()
      return t >= start && t < end
    })
    .reduce((acc, s) => acc + s.duration_seconds, 0)
  return Math.floor(seconds / 60)
}

// ─── Journey level calculation ────────────────────────────────────────────────
interface Level { level: number; required_sessions: number; required_events: number; required_meditation_days: number; required_retreats: number }

function calculateCurrentLevel(levels: Level[], stats: { completedSessions: number; attendedEvents: number; meditationDays: number; attendedRetreats: number }): number {
  let current = 1
  for (const level of levels) {
    if (
      stats.completedSessions >= level.required_sessions &&
      stats.attendedEvents >= level.required_events &&
      stats.meditationDays >= level.required_meditation_days &&
      stats.attendedRetreats >= level.required_retreats
    ) {
      current = level.level
    } else {
      break
    }
  }
  return current
}

const LEVELS: Level[] = [
  { level: 1, required_sessions: 0, required_events: 0, required_meditation_days: 0, required_retreats: 0 },
  { level: 2, required_sessions: 2, required_events: 1, required_meditation_days: 0, required_retreats: 0 },
  { level: 3, required_sessions: 4, required_events: 0, required_meditation_days: 5, required_retreats: 0 },
  { level: 4, required_sessions: 6, required_events: 2, required_meditation_days: 10, required_retreats: 0 },
  { level: 5, required_sessions: 8, required_events: 3, required_meditation_days: 15, required_retreats: 0 },
  { level: 6, required_sessions: 10, required_events: 1, required_meditation_days: 21, required_retreats: 1 },
  { level: 7, required_sessions: 12, required_events: 4, required_meditation_days: 30, required_retreats: 0 },
]

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('Streak calculation', () => {
  it('returns 0 for empty history', () => {
    expect(calculateStreak([])).toBe(0)
  })

  it('returns 0 if no recent meditation', () => {
    const old = new Date()
    old.setDate(old.getDate() - 3)
    const result = calculateStreak([old.toLocaleDateString('en-CA')])
    expect(result).toBe(0)
  })

  it('counts consecutive days', () => {
    const dates = []
    for (let i = 0; i < 5; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toLocaleDateString('en-CA'))
    }
    expect(calculateStreak(dates)).toBe(5)
  })
})

describe('Longest streak calculation', () => {
  it('returns 0 for empty', () => {
    expect(calculateLongestStreak([])).toBe(0)
  })

  it('returns 1 for single date', () => {
    expect(calculateLongestStreak(['2025-01-01'])).toBe(1)
  })

  it('detects longest run', () => {
    const dates = ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-10', '2025-01-11']
    expect(calculateLongestStreak(dates)).toBe(3)
  })
})

describe('Weekly total minutes', () => {
  it('returns 0 for no sessions', () => {
    expect(weeklyTotal([], new Date())).toBe(0)
  })

  it('sums minutes within the week', () => {
    const weekStart = new Date('2025-01-06T00:00:00Z') // Monday
    const sessions = [
      { completed_at: '2025-01-06T10:00:00Z', duration_seconds: 600 },
      { completed_at: '2025-01-07T10:00:00Z', duration_seconds: 1200 },
      { completed_at: '2025-01-13T10:00:00Z', duration_seconds: 600 }, // outside
    ]
    expect(weeklyTotal(sessions, weekStart)).toBe(30)
  })
})

describe('Journey level calculation', () => {
  it('starts at level 1 with no activity', () => {
    expect(calculateCurrentLevel(LEVELS, { completedSessions: 0, attendedEvents: 0, meditationDays: 0, attendedRetreats: 0 })).toBe(1)
  })

  it('reaches level 2 with 2 sessions and 1 event', () => {
    expect(calculateCurrentLevel(LEVELS, { completedSessions: 2, attendedEvents: 1, meditationDays: 0, attendedRetreats: 0 })).toBe(2)
  })

  it('reaches level 4 with full Steady Seeker requirements', () => {
    expect(calculateCurrentLevel(LEVELS, { completedSessions: 6, attendedEvents: 2, meditationDays: 10, attendedRetreats: 0 })).toBe(4)
  })

  it('does not skip levels', () => {
    // Has level 5 sessions/events but not level 3 meditation days
    expect(calculateCurrentLevel(LEVELS, { completedSessions: 8, attendedEvents: 3, meditationDays: 0, attendedRetreats: 0 })).toBe(2)
  })

  it('reaches level 7 with all requirements', () => {
    // Level 6 requires 1 retreat, so retreats must be >= 1 to pass through it to level 7
    expect(calculateCurrentLevel(LEVELS, { completedSessions: 12, attendedEvents: 4, meditationDays: 30, attendedRetreats: 1 })).toBe(7)
  })
})
