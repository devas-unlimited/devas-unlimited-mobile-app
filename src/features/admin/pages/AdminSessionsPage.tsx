import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Search, RefreshCw, Video } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ClientSession } from '@/types/database'

type SessionRow = ClientSession & { participant_count?: number }

async function fetchAdminSessions(filter: string, search: string): Promise<SessionRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('client_sessions') as any)
    .select('*')
    .order('starts_at', { ascending: false })

  if (filter !== 'all') q = q.eq('status', filter)
  if (search) q = q.ilike('title', `%${search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as SessionRow[]
}

const RECORDING_BADGE: Record<string, { label: string; color: string }> = {
  none:       { label: 'No recording', color: '#C4B5BD' },
  processing: { label: 'Processing',   color: '#E6B74B' },
  available:  { label: 'Recording live', color: '#2D6B4A' },
  expired:    { label: 'Expired',      color: '#C0392B' },
}

export function AdminSessionsPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const { data: sessions = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'sessions', filter, search],
    queryFn: () => fetchAdminSessions(filter, search),
    staleTime: 0,
  })

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Client Sessions</h1>
          <p className="text-sm text-[#8C7B85] mt-0.5">{sessions.length} sessions</p>
        </div>
        <button
          onClick={() => navigate('/admin/sessions/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors"
        >
          <Plus size={16} /> New session
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sessions…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'scheduled', 'completed', 'cancelled'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-[#7C2447] text-white' : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#8C7B85] mb-3">Failed to load</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 mx-auto text-xs text-[#7C2447]"><RefreshCw size={13} /> Retry</button>
          </div>
        ) : sessions.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E8DDF2] flex items-center justify-center mx-auto mb-3">
              <Video size={20} className="text-[#7C2447]" />
            </div>
            <p className="text-sm text-[#8C7B85] mb-4">No sessions found</p>
            <button onClick={() => navigate('/admin/sessions/new')} className="px-4 py-2 bg-[#7C2447] text-white rounded-xl text-sm font-medium">Create first session</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E6EC]">
                  {['Title', 'Type', 'Coach', 'Date', 'Duration', 'Status', 'Recording', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8C7B85] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0E9]">
                {sessions.map(s => {
                  const rec = RECORDING_BADGE[s.recording_status]
                  return (
                    <tr key={s.id} className="hover:bg-[#FCF7F0] transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#321B26] truncate max-w-[180px]">{s.title}</p>
                      </td>
                      <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap capitalize">{s.session_kind}</td>
                      <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap">{s.coach_name ?? '—'}</td>
                      <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap">{format(new Date(s.starts_at), 'dd MMM yy')}</td>
                      <td className="px-4 py-3 text-[#8C7B85] whitespace-nowrap">{s.duration_minutes ? `${s.duration_minutes}m` : '—'}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={s.status} size="sm" /></td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-xs font-medium" style={{ color: rec.color }}>{rec.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/sessions/${s.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8DDF2] text-[#7C2447] hover:bg-[#7C2447] hover:text-white transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  )
}
