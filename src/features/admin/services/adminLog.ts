import { supabase } from '@/lib/supabase'

export async function logAdminAction(
  adminUserId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  summary: string,
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('admin_activity_log') as any).insert({
      admin_user_id: adminUserId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      summary,
    })
  } catch {
    // Activity log failures must never break the main operation
  }
}

export async function fetchRecentActivity(limit = 20) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('admin_activity_log') as any)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  type LogRow = {
    id: string
    admin_user_id: string
    action: string
    entity_type: string
    entity_id: string | null
    summary: string
    created_at: string
  }
  return (data ?? []) as LogRow[]
}
