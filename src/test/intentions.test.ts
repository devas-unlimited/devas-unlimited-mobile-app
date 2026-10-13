import { describe, it, expect } from 'vitest'
import { INTENTIONS, getTodayIntention } from '@/lib/intentions'

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 9, 30)

describe('Daily intentions', () => {
  it('has all 31 intentions', () => {
    expect(INTENTIONS).toHaveLength(31)
  })

  it('starts the cycle with the first intention', () => {
    expect(getTodayIntention(day(2026, 10, 12))).toBe('Today, I choose peace over reaction.')
  })

  it('moves to the next intention each day', () => {
    expect(getTodayIntention(day(2026, 10, 13))).toBe(INTENTIONS[1])
    expect(getTodayIntention(day(2026, 10, 14))).toBe(INTENTIONS[2])
  })

  it('stays the same all day', () => {
    expect(getTodayIntention(new Date(2026, 9, 20, 0, 1))).toBe(getTodayIntention(new Date(2026, 9, 20, 23, 59)))
  })

  it('ends with the last intention, then loops back to the first', () => {
    expect(getTodayIntention(day(2026, 11, 11))).toBe('Today, I surrender, trust, and allow.')
    expect(getTodayIntention(day(2026, 11, 12))).toBe(INTENTIONS[0])
  })

  it('handles dates before the cycle start', () => {
    expect(getTodayIntention(day(2026, 10, 11))).toBe(INTENTIONS[30])
  })
})
