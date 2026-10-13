import { useCallback, useEffect, useRef } from 'react'
import { deleteImages } from '@/services/storage'

/**
 * Tracks images uploaded in a form that haven't been saved yet, so storage never
 * keeps orphans:
 *  - replacing/removing an unsaved upload deletes it straight away
 *  - leaving the form without saving deletes every unsaved upload
 *  - after a successful save, `commit(savedUrls)` keeps those and deletes the rest
 */
export function useStagedUploads() {
  const staged = useRef(new Set<string>())

  const track = useCallback((url: string) => { staged.current.add(url) }, [])

  /** Delete an upload if it was never saved (saved images are handled on save) */
  const discard = useCallback((url: string | null | undefined) => {
    if (url && staged.current.delete(url)) void deleteImages(url)
  }, [])

  const commit = useCallback((...keep: (string | null | undefined)[]) => {
    const unused = [...staged.current].filter(u => !keep.includes(u))
    staged.current.clear()
    void deleteImages(...unused)
  }, [])

  useEffect(() => {
    const set = staged.current
    return () => {
      if (set.size) void deleteImages(...set)
      set.clear()
    }
  }, [])

  return { track, discard, commit }
}

export type StagedUploads = ReturnType<typeof useStagedUploads>
