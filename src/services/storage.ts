import { supabase } from '@/lib/supabase'

export const MEDIA_BUCKET = 'media'
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
}

export type MediaFolder = 'banners' | 'events' | 'announcements'

/** Returns an error message, or null if the file can be uploaded */
export function validateImage(file: Pick<File, 'type' | 'size'>): string | null {
  if (!IMAGE_TYPES[file.type]) return 'Please choose a JPG, PNG, WebP or GIF image.'
  if (file.size > MAX_IMAGE_BYTES) return 'Image is too large — the maximum is 5 MB.'
  return null
}

/** Uploads an image to the media bucket and returns its public URL */
export async function uploadImage(file: File, folder: MediaFolder): Promise<string> {
  const problem = validateImage(file)
  if (problem) throw new Error(problem)

  const path = `${folder}/${crypto.randomUUID()}.${IMAGE_TYPES[file.type]}`
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false })
  if (error) throw new Error(error.message || 'Upload failed')

  return supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path).data.publicUrl
}

/**
 * The object path inside our media bucket for a URL we uploaded, or null for
 * anything else (external links, app assets like /brand/…) — those are never deleted.
 */
export function storagePathFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${MEDIA_BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + marker.length).split('?')[0]) || null
}

/** Deletes uploaded images from storage. Non-uploaded URLs are ignored. Never throws. */
export async function deleteImages(...urls: (string | null | undefined)[]): Promise<void> {
  const paths = [...new Set(urls.map(storagePathFromUrl).filter((p): p is string => Boolean(p)))]
  if (paths.length === 0) return
  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove(paths)
  if (error) console.warn('[Devas] Could not delete images from storage:', error.message)
}
