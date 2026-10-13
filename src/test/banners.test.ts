import { describe, it, expect } from 'vitest'
import { bannerStatus, isExternalLink, BANNER_THEMES } from '@/services/banners'

const now = new Date('2026-10-12T12:00:00Z')
const hour = 60 * 60 * 1000
const at = (offsetHours: number) => new Date(now.getTime() + offsetHours * hour).toISOString()

describe('bannerStatus', () => {
  it('is live when active with no schedule', () => {
    expect(bannerStatus({ is_active: true, starts_at: null, ends_at: null }, now)).toBe('live')
  })

  it('is hidden when inactive, regardless of schedule', () => {
    expect(bannerStatus({ is_active: false, starts_at: at(-1), ends_at: at(1) }, now)).toBe('hidden')
  })

  it('is scheduled before its start time', () => {
    expect(bannerStatus({ is_active: true, starts_at: at(2), ends_at: null }, now)).toBe('scheduled')
  })

  it('is expired once its end time has passed', () => {
    expect(bannerStatus({ is_active: true, starts_at: null, ends_at: at(-1) }, now)).toBe('expired')
  })

  it('is live inside its window', () => {
    expect(bannerStatus({ is_active: true, starts_at: at(-1), ends_at: at(1) }, now)).toBe('live')
  })
})

describe('isExternalLink', () => {
  it('detects websites', () => {
    expect(isExternalLink('https://loverocks.in')).toBe(true)
    expect(isExternalLink('http://example.com')).toBe(true)
  })

  it('treats app paths as internal', () => {
    expect(isExternalLink('/events')).toBe(false)
  })
})

describe('BANNER_THEMES', () => {
  it('matches the themes allowed by the database', () => {
    expect(Object.keys(BANNER_THEMES).sort()).toEqual(['cream', 'gold', 'lavender', 'plum', 'rose'])
  })
})
