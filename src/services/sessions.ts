import { supabase } from '@/lib/supabase'
import type { ClientSession, SessionParticipant } from '@/types/database'

export type SessionWithParticipant = ClientSession & {
  session_participants: SessionParticipant[]
}

export async function fetchUserSessions(userId: string, kind?: string): Promise<SessionWithParticipant[]> {
  let query = supabase
    .from('client_sessions')
    .select(`
      *,
      session_participants!inner(*)
    `)
    .eq('session_participants.user_id', userId)
    .order('starts_at', { ascending: false })
    .limit(50)

  if (kind && kind !== 'All') {
    query = query.eq('session_kind', kind === 'Group' ? 'group' : '1on1')
  }

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as SessionWithParticipant[]
}

/** The user's next scheduled session, if any */
export async function fetchNextSession(userId: string): Promise<SessionWithParticipant | null> {
  const { data, error } = await supabase
    .from('client_sessions')
    .select('*, session_participants!inner(*)')
    .eq('session_participants.user_id', userId)
    .eq('status', 'scheduled')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as SessionWithParticipant | null
}

export async function fetchSessionById(sessionId: string, userId: string): Promise<SessionWithParticipant | null> {
  const { data, error } = await supabase
    .from('client_sessions')
    .select(`
      *,
      session_participants!inner(*)
    `)
    .eq('id', sessionId)
    .eq('session_participants.user_id', userId)
    .single()

  if (error) return null
  return data as SessionWithParticipant | null
}
