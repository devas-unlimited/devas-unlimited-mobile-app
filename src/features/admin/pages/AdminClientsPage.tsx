import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Search, RefreshCw, User } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { Skeleton } from '@/components/ui/Skeleton'
import type { AdminClientRow } from '@/types/database'

async function fetchClients(search: string): Promise<AdminClientRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('profiles') as any)
    .select('id, full_name, avatar_url, role, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (search) q = q.ilike('full_name', `%${search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as AdminClientRow[]
}

export function AdminClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'clients', search],
    queryFn: () => fetchClients(search),
    staleTime: 0,
  })

  const clientCount = clients.filter(c => c.role === 'client').length
  const adminCount = clients.filter(c => c.role === 'admin').length

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#321B26]">Clients</h1>
        <p className="text-sm text-[#8C7B85] mt-0.5">{clientCount} clients · {adminCount} admins</p>
      </div>

      <div className="relative max-w-xs mb-5">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#8C7B85] mb-3">Failed to load clients</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 mx-auto text-xs text-[#7C2447]"><RefreshCw size={13} /> Retry</button>
          </div>
        ) : clients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E8DDF2] flex items-center justify-center mx-auto mb-3">
              <User size={20} className="text-[#7C2447]" />
            </div>
            <p className="text-sm text-[#8C7B85]">No clients found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E6EC]">
                  {['Client', 'Role', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8C7B85] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0E9]">
                {clients.map(c => {
                  const initials = (c.full_name ?? '?')[0]?.toUpperCase()
                  return (
                    <tr key={c.id} className="hover:bg-[#FCF7F0] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#7C2447] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-[#321B26]">{c.full_name ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold capitalize px-2 py-1 rounded-full ${c.role === 'admin' ? 'bg-[#E8DDF2] text-[#7C2447]' : 'bg-[#F7F0E9] text-[#8C7B85]'}`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#8C7B85] whitespace-nowrap text-xs">
                        {format(new Date(c.created_at), 'dd MMM yyyy')}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/admin/clients/${c.id}`)}
                          className="text-xs font-medium text-[#7C2447] hover:underline"
                        >
                          View
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
