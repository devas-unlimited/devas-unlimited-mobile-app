import { describe, it, expect } from 'vitest'
import { youtubeId, youtubeWatchUrl, resourceThumbnail, isYouTubeVideo } from '@/services/sanctuary'

describe('youtubeId', () => {
  it.each([
    ['https://youtu.be/Exmv32HzcCs', 'Exmv32HzcCs'],
    ['https://youtu.be/7_o5oaHyae4?si=abc123', '7_o5oaHyae4'],
    ['https://www.youtube.com/watch?v=QS-n6H2bipQ', 'QS-n6H2bipQ'],
    ['https://m.youtube.com/watch?feature=share&v=jAdvK88r-eY&t=30', 'jAdvK88r-eY'],
    ['https://www.youtube.com/shorts/ii7ElF3LtCU', 'ii7ElF3LtCU'],
    ['https://www.youtube.com/embed/8bss-YweUkY', '8bss-YweUkY'],
    ['https://www.youtube.com/live/HmSt3JymXq0', 'HmSt3JymXq0'],
  ])('reads the ID from %s', (url, id) => {
    expect(youtubeId(url)).toBe(id)
  })

  it.each([
    'https://soundcloud.com/devas-unlimited/sets/8-9th-retreat',
    'https://www.youtube.com/@DevasUnlimited',
    'https://vimeo.com/123456',
    '',
  ])('returns null for non-video links: %s', url => {
    expect(youtubeId(url)).toBeNull()
  })
})

describe('youtubeWatchUrl', () => {
  it('turns short links into the canonical watch link', () => {
    expect(youtubeWatchUrl({ external_url: 'https://youtu.be/Exmv32HzcCs?si=x' })).toBe('https://www.youtube.com/watch?v=Exmv32HzcCs')
  })

  it('leaves other links untouched', () => {
    const url = 'https://loverocks.in'
    expect(youtubeWatchUrl({ external_url: url })).toBe(url)
  })
})

describe('resourceThumbnail', () => {
  it('prefers the saved thumbnail', () => {
    expect(resourceThumbnail({ thumbnail_url: 'https://x.test/a.jpg', external_url: 'https://youtu.be/Exmv32HzcCs' })).toBe('https://x.test/a.jpg')
  })

  it("falls back to YouTube's own thumbnail for videos", () => {
    expect(resourceThumbnail({ thumbnail_url: null, external_url: 'https://youtu.be/Exmv32HzcCs' })).toBe('https://i.ytimg.com/vi/Exmv32HzcCs/hqdefault.jpg')
  })

  it('returns null when there is nothing to show', () => {
    expect(resourceThumbnail({ thumbnail_url: null, external_url: 'https://soundcloud.com/a/b' })).toBeNull()
  })
})

describe('isYouTubeVideo', () => {
  it('recognises YouTube video links', () => {
    expect(isYouTubeVideo({ provider: 'youtube', external_url: 'https://youtu.be/Exmv32HzcCs' })).toBe(true)
    expect(isYouTubeVideo({ provider: 'soundcloud', external_url: 'https://soundcloud.com/a/sets/b' })).toBe(false)
  })
})
