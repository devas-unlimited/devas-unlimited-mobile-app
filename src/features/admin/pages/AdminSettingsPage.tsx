import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthContext'
import { AdminShell } from '../layout/AdminShell'
import { supabase } from '@/lib/supabase'
import { fetchRecentActivity } from '../services/adminLog'
import { format } from 'date-fns'
import { Shield, Clock, Database } from 'lucide-react'

async function fetchAdminRoles() {
  const [rolesRes, profilesRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('user_roles') as any).select('*, profiles(full_name)').order('created_at'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any).select('id, full_name, role').in('role', ['admin']).limit(20),
  ])
  return {
    roles: (rolesRes.data ?? []) as { id: string; user_id: string; role: string; created_at: string; profiles: { full_name: string | null } | null }[],
    adminProfiles: (profilesRes.data ?? []) as { id: string; full_name: string | null; role: string }[],
  }
}

export function AdminSettingsPage() {
  const { user, profile } = useAuth()

  const { data: roleData } = useQuery({
    queryKey: ['admin', 'settings', 'roles'],
    queryFn: fetchAdminRoles,
    staleTime: 0,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['admin', 'settings', 'activity'],
    queryFn: () => fetchRecentActivity(50),
    staleTime: 0,
  })

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#321B26]">Settings</h1>
        <p className="text-sm text-[#8C7B85] mt-0.5">Admin configuration &amp; audit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current admin info */}
        <Card icon={<Shield size={16} className="text-[#7C2447]" />} title="Your admin session">
          <div className="flex items-center gap-4 p-4 bg-[#FCF7F0] rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-[#7C2447] text-white flex items-center justify-center font-bold">
              {(profile?.full_name ?? user?.email ?? 'A')[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#321B26]">{profile?.full_name ?? '—'}</p>
              <p className="text-xs text-[#8C7B85]">{user?.email}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Row label="User ID" value={user?.id?.slice(0, 8) + '…'} />
            <Row label="Profile role" value={profile?.role ?? '—'} />
            <Row label="DB roles" value={(roleData?.roles.map(r => r.role).join(', ')) || '—'} />
          </div>
        </Card>

        {/* Grant admin instructions */}
        <Card icon={<Database size={16} className="text-[#1A6B7C]" />} title="Grant admin access">
          <p className="text-sm text-[#8C7B85] mb-3">
            To grant admin access to another user, run this SQL in your Supabase SQL editor:
          </p>
          <pre className="bg-[#1A1A2E] text-[#A8D8A8] text-xs rounded-xl p-4 overflow-x-auto leading-relaxed">
{`insert into public.user_roles (user_id, role)
values (
  'REPLACE_WITH_USER_UUID',
  'admin'   -- or 'super_admin'
);`}
          </pre>
          <p className="text-xs text-[#C4B5BD] mt-3">
            Get user UUIDs from: Authentication → Users in your Supabase dashboard
          </p>
        </Card>

        {/* Admin users */}
        {roleData && roleData.roles.length > 0 && (
          <Card icon={<Shield size={16} className="text-[#5B3A7C]" />} title={`Admin users (${roleData.roles.length})`}>
            <div className="space-y-2">
              {roleData.roles.map(r => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-[#FCF7F0] rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-[#321B26]">{r.profiles?.full_name ?? r.user_id.slice(0, 8)}</p>
                    <p className="text-xs text-[#8C7B85]">Since {format(new Date(r.created_at), 'dd MMM yyyy')}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${r.role === 'super_admin' ? 'bg-[#E8DDF2] text-[#7C2447]' : 'bg-[#F0E6EC] text-[#4A3540]'}`}>
                    {r.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Activity log */}
        <Card icon={<Clock size={16} className="text-[#2D6B4A]" />} title={`Activity log (last ${activity.length})`}>
          {activity.length === 0 ? (
            <p className="text-sm text-[#C4B5BD] text-center py-4">No activity yet</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activity.map(a => (
                <div key={a.id} className="flex items-start gap-3 p-3 bg-[#FCF7F0] rounded-xl">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#321B26] font-medium">{a.summary}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-[#C4B5BD]">{format(new Date(a.created_at), 'dd MMM HH:mm')}</span>
                      <span className="text-[10px] text-[#8C7B85] bg-[#F7F0E9] px-1.5 py-0.5 rounded">{a.entity_type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AdminShell>
  )
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-sm font-bold text-[#321B26]">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#8C7B85]">{label}</span>
      <span className="text-[#321B26] font-medium">{value}</span>
    </div>
  )
}
