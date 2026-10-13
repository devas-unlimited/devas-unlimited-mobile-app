import { describe, it, expect } from 'vitest'
import { storagePathFromUrl, validateImage, MAX_IMAGE_BYTES } from '@/services/storage'

const BASE = 'https://lpxxbmvglyzbnqcktcvz.supabase.co/storage/v1/object/public/media'

describe('storagePathFromUrl', () => {
  it('extracts the path of images uploaded to our media bucket', () => {
    expect(storagePathFromUrl(`${BASE}/banners/abc.jpg`)).toBe('banners/abc.jpg')
  })

  it('ignores query strings', () => {
    expect(storagePathFromUrl(`${BASE}/events/x.png?v=2`)).toBe('events/x.png')
  })

  it('never targets external links or app assets', () => {
    expect(storagePathFromUrl('https://i1.sndcdn.com/artworks-x-t500x500.jpg')).toBeNull()
    expect(storagePathFromUrl('/brand/loverocks-logo.png')).toBeNull()
    expect(storagePathFromUrl('https://x.supabase.co/storage/v1/object/public/other-bucket/a.jpg')).toBeNull()
  })

  it('handles empty values', () => {
    expect(storagePathFromUrl(null)).toBeNull()
    expect(storagePathFromUrl('')).toBeNull()
  })
})

describe('validateImage', () => {
  it('accepts supported images under 5 MB', () => {
    expect(validateImage({ type: 'image/png', size: 1024 })).toBeNull()
    expect(validateImage({ type: 'image/webp', size: MAX_IMAGE_BYTES })).toBeNull()
  })

  it('rejects other file types', () => {
    expect(validateImage({ type: 'image/svg+xml', size: 100 })).toMatch(/JPG, PNG/)
    expect(validateImage({ type: 'application/pdf', size: 100 })).toMatch(/JPG, PNG/)
  })

  it('rejects files over 5 MB', () => {
    expect(validateImage({ type: 'image/jpeg', size: MAX_IMAGE_BYTES + 1 })).toMatch(/5 MB/)
  })
})
