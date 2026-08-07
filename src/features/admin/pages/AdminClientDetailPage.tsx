import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Video, BookOpen } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { Profile, ClientSession, Event, MeditationSession } from '@/types/database'

async function fetchClientDetail(userId: string) {
  const [profileRes, sessionsRes, eventsRes, meditationRes] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('profiles') as any).select('*').eq('id', userId).single(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('client_sessions') as any)
      .select('id, title, starts_at, status, session_kind, duration_minutes')
      .eq('is_private', false)
      .order('starts_at', { ascending: false })
      .limit(10),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('event_participants') as any)
      .select('events(id, title, starts_at, category)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase.from('meditation_sessions') as any)
      .select('id, duration_seconds, completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(10),
  ])

  return {
    profile: profileRes.data as Profile | null,
    sessions: (sessionsRes.data ?? []) as Partial<ClientSession>[],
    events: ((eventsRes.data ?? []) as any[]).map((ep: any) => ep.events).filter(Boolean) as Partial<Event>[],
    meditation: (meditationRes.data ?? []) as Partial<MeditationSession>[],
  }
}

export function AdminClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'client', id],
    queryFn: () => fetchClientDetail(id!),
    enabled: Boolean(id),
    staleTime: 0,
  })

  const profile = data?.profile
  const initials = (profile?.full_name ?? '?')[0]?.toUpperCase()
  const totalMeditationSeconds = data?.meditation.reduce((a, m) => a + (m.duration_seconds ?? 0), 0) ?? 0
  const totalMeditationMinutes = Math.round(totalMeditationSeconds / 60)

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/clients')}
          className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-[#321B26]">Client Profile</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      ) : !profile ? (
        <div className="py-24 text-center">
          <p className="text-[#8C7B85]">Client not found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile card */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#7C2447] text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-[#321B26]">{profile.full_name ?? '—'}</h2>
              <p className="text-sm text-[#8C7B85]">Joined {format(new Date(profile.created_at), 'dd MMMM yyyy')}</p>
              <span className={`inline-block mt-2 text-xs font-semibold capitalize px-2 py-1 rounded-full ${profile.role === 'admin' ? 'bg-[#E8DDF2] text-[#7C2447]' : 'bg-[#F7F0E9] text-[#8C7B85]'}`}>
                {profile.role}
              </span>
            </div>
            <div className="hidden sm:grid grid-cols-3 gap-6 text-center">
              <Metric icon={<Video size={16} />} value={data?.sessions.length ?? 0} label="Sessions" />
              <Metric icon={<Calendar size={16} />} value={data?.events.length ?? 0} label="Events" />
              <Metric icon={<BookOpen size={16} />} value={totalMeditationMinutes} label="Meditation mins" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions */}
            <InfoCard title="Recent sessions" icon={<Video size={15} className="text-[#7C2447]" />}>
              {data?.sessions.length === 0 ? (
                <p className="text-sm text-[#C4B5BD] text-center py-4">No sessions yet</p>
              ) : (
                <div className="space-y-2">
                  {data?.sessions.map(s => (
                    <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FCF7F0] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#321B26] truncate">{s.title}</p>
                        <p className="text-xs text-[#8C7B85]">{s.starts_at ? format(new Date(s.starts_at), 'dd MMM yy') : '—'}</p>
                      </div>
                      {s.status && <StatusBadge status={s.status} size="sm" />}
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>

            {/* Events */}
            <InfoCard title="Events attended" icon={<Calendar size={15} className="text-[#1A6B7C]" />}>
              {data?.events.length === 0 ? (
                <p className="text-sm text-[#C4B5BD] text-center py-4">No events yet</p>
              ) : (
                <div className="space-y-2">
                  {data?.events.map(e => (
                    <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#FCF7F0] transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#321B26] truncate">{e.title}</p>
                        <p className="text-xs text-[#8C7B85]">{e.starts_at ? format(new Date(e.starts_at), 'dd MMM yy') : '—'} · {e.category}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </InfoCard>
          </div>
        </div>
      )}
    </AdminShell>
  )
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div>
      <div className="flex items-center justify-center mb-1 text-[#7C2447]">{icon}</div>
      <p className="text-xl font-bold text-[#321B26]">{value}</p>
      <p className="text-xs text-[#8C7B85]">{label}</p>
    </div>
  )
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
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
