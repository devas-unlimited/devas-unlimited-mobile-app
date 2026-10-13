import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

const CHANNEL_NAME = 'app-content'
const EVENT_NAME = 'content-changed'

// entity_type values used by logAdminAction → tables they write to
const ENTITY_TABLES: Record<string, string[]> = {
  event: ['events'],
  announcement: ['announcements'],
  home_banner: ['home_banners'],
  resource: ['sanctuary_resources'],
  client_session: ['sessions', 'session_participants'],
}

// tables → client query key prefixes that show their data
const TABLE_QUERY_KEYS: Record<string, string[]> = {
  events: ['events'],
  announcements: ['announcements'],
  home_banners: ['banners'],
  sanctuary_resources: ['sanctuary'],
  sessions: ['sessions', 'session', 'dashboard-stats', 'journey-progress'],
  session_participants: ['sessions', 'session', 'dashboard-stats', 'journey-progress'],
  meditation_sessions: ['dashboard-stats', 'meditation-insights', 'journey-progress'],
}

let channel: RealtimeChannel | null = null

function ensureChannel() {
  if (!channel) {
    channel = supabase.channel(CHANNEL_NAME, {
      config: { broadcast: { self: false } },
    })
  }
  return channel
}

/** Broadcast a content change to every open client app. Fire-and-forget. */
export async function notifyContentChanged(entityType: string) {
  const tables = ENTITY_TABLES[entityType]
  if (!tables) return
  try {
    // send() falls back to REST when the channel isn't joined yet
    await ensureChannel().send({ type: 'broadcast', event: EVENT_NAME, payload: { tables } })
  } catch {
    // Never let a sync failure break the admin's save
  }
}

/** Keeps open client apps fresh: refetches affected queries when the admin changes content. */
export function useContentSync() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const ch = ensureChannel()

    ch.on('broadcast', { event: EVENT_NAME }, ({ payload }) => {
      const keys = new Set<string>()
      for (const table of (payload?.tables ?? []) as string[]) {
        for (const key of TABLE_QUERY_KEYS[table] ?? []) keys.add(key)
      }
      if (keys.size === 0) {
        queryClient.invalidateQueries()
      } else {
        for (const key of keys) queryClient.invalidateQueries({ queryKey: [key] })
      }
    })

    ch.subscribe((status) => {
      // On (re)connect, refetch everything to catch changes missed while disconnected
      if (status === 'SUBSCRIBED') queryClient.invalidateQueries()
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }
  }, [queryClient])
}
