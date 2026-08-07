import { describe, it, expect, vi } from 'vitest'

// ─── slugify helper (inlined to avoid UI imports) ───────────────────────────
function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// ─── Status badge logic ──────────────────────────────────────────────────────
const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  published: { bg: '#DDE9D3', text: '#2D6B4A' },
  draft:     { bg: '#F7F0E9', text: '#8C7B85' },
  archived:  { bg: '#F0E6F6', text: '#5B3A7C' },
  cancelled: { bg: '#FDECEA', text: '#C0392B' },
  scheduled: { bg: '#DDEDF1', text: '#1A6B7C' },
}

function getStatusStyle(status: string) {
  return STATUS_STYLES[status] ?? { bg: '#F7F0E9', text: '#8C7B85' }
}

// ─── Admin log ──────────────────────────────────────────────────────────────
async function safeLogAction(
  logFn: (userId: string, action: string, entity: string, id: string | null, summary: string) => Promise<void>,
  userId: string,
  action: string,
  entity: string,
  id: string | null,
  summary: string,
) {
  try {
    await logFn(userId, action, entity, id, summary)
    return true
  } catch {
    return false
  }
}

// ─── Tests ──────────────────────────────────────────────────────────────────
describe('Admin: slugify', () => {
  it('converts title to valid slug', () => {
    expect(slugify('Devas Retreat 2025')).toBe('devas-retreat-2025')
  })

  it('removes special characters', () => {
    expect(slugify('Hello, World! 🌿')).toBe('hello-world')
  })

  it('collapses multiple hyphens', () => {
    expect(slugify('   test   event   ')).toBe('test-event')
  })

  it('strips leading/trailing hyphens', () => {
    expect(slugify('--my-event--')).toBe('my-event')
  })
})

describe('Admin: status badge styling', () => {
  it('returns green for published', () => {
    expect(getStatusStyle('published').text).toBe('#2D6B4A')
  })

  it('returns muted for draft', () => {
    expect(getStatusStyle('draft').text).toBe('#8C7B85')
  })

  it('returns fallback for unknown status', () => {
    expect(getStatusStyle('unknown').bg).toBe('#F7F0E9')
  })

  it('returns red-toned for cancelled', () => {
    expect(getStatusStyle('cancelled').bg).toBe('#FDECEA')
  })
})

describe('Admin: activity log resilience', () => {
  it('does not throw when log function fails', async () => {
    const failingLog = vi.fn().mockRejectedValue(new Error('DB offline'))
    const result = await safeLogAction(failingLog, 'user-1', 'create', 'event', 'ev-1', 'Created event')
    expect(result).toBe(false)
    expect(failingLog).toHaveBeenCalledOnce()
  })

  it('returns true when log succeeds', async () => {
    const okLog = vi.fn().mockResolvedValue(undefined)
    const result = await safeLogAction(okLog, 'user-1', 'update', 'announcement', 'ann-1', 'Updated')
    expect(result).toBe(true)
  })
})

describe('Admin: authorization role check', () => {
  const ALLOWED_ROLES = ['admin', 'super_admin']

  function isAuthorized(roles: string[]): boolean {
    return roles.some(r => ALLOWED_ROLES.includes(r))
  }

  it('grants access to admin role', () => {
    expect(isAuthorized(['admin'])).toBe(true)
  })

  it('grants access to super_admin role', () => {
    expect(isAuthorized(['super_admin'])).toBe(true)
  })

  it('denies access to client role', () => {
    expect(isAuthorized(['client'])).toBe(false)
  })

  it('denies access when no roles', () => {
    expect(isAuthorized([])).toBe(false)
  })

  it('denies access with unknown role', () => {
    expect(isAuthorized(['moderator'])).toBe(false)
  })
})

describe('Admin: announcement scheduling', () => {
  function isAnnouncementVisible(publishedAt: string | null, expiresAt: string | null, now = new Date()) {
    if (publishedAt && new Date(publishedAt) > now) return false
    if (expiresAt && new Date(expiresAt) <= now) return false
    return true
  }

  it('visible when published and not expired', () => {
    const past = new Date(Date.now() - 60000).toISOString()
    const future = new Date(Date.now() + 60000).toISOString()
    expect(isAnnouncementVisible(past, future)).toBe(true)
  })

  it('hidden when publishedAt is in the future', () => {
    const future = new Date(Date.now() + 60000).toISOString()
    expect(isAnnouncementVisible(future, null)).toBe(false)
  })

  it('hidden when already expired', () => {
    const past1 = new Date(Date.now() - 120000).toISOString()
    const past2 = new Date(Date.now() - 60000).toISOString()
    expect(isAnnouncementVisible(past1, past2)).toBe(false)
  })

  it('visible with no dates set', () => {
    expect(isAnnouncementVisible(null, null)).toBe(true)
  })
})
