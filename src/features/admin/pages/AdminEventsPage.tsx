import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Edit2, Archive, Star, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { Skeleton } from '@/components/ui/Skeleton'

type EventRow = {
  id: string; title: string; category: string; format: string
  starts_at: string; city: string | null; status: string
  is_featured: boolean; is_published: boolean; created_at: string
}

const STATUS_FILTERS = ['all', 'draft', 'published', 'scheduled', 'archived', 'cancelled']

async function fetchAdminEvents(filter: string, search: string): Promise<EventRow[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('events') as any)
    .select('id, title, category, format, starts_at, city, status, is_featured, is_published, created_at')
    .order('starts_at', { ascending: false })

  if (filter !== 'all') q = q.eq('status', filter)
  if (search) q = q.ilike('title', `%${search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as EventRow[]
}

export function AdminEventsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<EventRow | null>(null)

  const { data: events = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'events', filter, search],
    queryFn: () => fetchAdminEvents(filter, search),
    staleTime: 0,
  })

  const archiveMutation = useMutation({
    mutationFn: async (ev: EventRow) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('events') as any)
        .update({ status: 'archived', archived_at: new Date().toISOString(), is_published: false })
        .eq('id', ev.id)
      if (error) throw error
      await logAdminAction(user!.id, 'archive', 'event', ev.id, `Archived event: ${ev.title}`)
    },
    onSuccess: () => {
      toast('Event archived', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      setArchiveTarget(null)
    },
    onError: () => toast('Failed to archive event', 'error'),
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (ev: EventRow) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('events') as any)
        .update({ is_featured: !ev.is_featured })
        .eq('id', ev.id)
      if (error) throw error
      await logAdminAction(user!.id, 'update', 'event', ev.id, `${ev.is_featured ? 'Unfeatured' : 'Featured'} event: ${ev.title}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Events & Retreats</h1>
          <p className="text-sm text-[#8C7B85] mt-0.5">{events.length} items</p>
        </div>
        <button
          onClick={() => navigate('/admin/events/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors"
        >
          <Plus size={16} /> New event
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447]"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${filter === s ? 'bg-[#7C2447] text-white' : 'bg-white text-[#8C7B85] border border-[#E8DDF2] hover:border-[#7C2447]/30'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] overflow-hidden">
        {isLoading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : error ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#8C7B85] mb-3">Failed to load events</p>
            <button onClick={() => refetch()} className="flex items-center gap-2 mx-auto text-xs text-[#7C2447] font-medium">
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#8C7B85] mb-4">No events found</p>
            <button onClick={() => navigate('/admin/events/new')} className="px-4 py-2 bg-[#7C2447] text-white rounded-xl text-sm font-medium">
              Create first event
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E6EC] text-left">
                  {['Title', 'Category', 'Date', 'Location', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold text-[#8C7B85] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0E9]">
                {events.map(ev => (
                  <tr key={ev.id} className="hover:bg-[#FCF7F0] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#321B26] truncate max-w-[200px]">{ev.title}</p>
                      <p className="text-xs text-[#8C7B85]">{ev.format}</p>
                    </td>
                    <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap">{ev.category}</td>
                    <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap">{format(new Date(ev.starts_at), 'dd MMM yy')}</td>
                    <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap">{ev.city ?? '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={ev.status} size="sm" /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeaturedMutation.mutate(ev)}
                        aria-label={ev.is_featured ? 'Unfeature' : 'Feature'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${ev.is_featured ? 'bg-[#FFF3D6] text-[#E6B74B]' : 'bg-[#F7F0E9] text-[#C4B5BD] hover:text-[#E6B74B]'}`}
                      >
                        <Star size={14} fill={ev.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/events/${ev.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8DDF2] text-[#7C2447] hover:bg-[#7C2447] hover:text-white transition-colors"
                          aria-label="Edit event"
                        >
                          <Edit2 size={13} />
                        </button>
                        {ev.status !== 'archived' && (
                          <button
                            onClick={() => setArchiveTarget(ev)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0E9] text-[#8C7B85] hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Archive event"
                          >
                            <Archive size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive this event?"
        message={`"${archiveTarget?.title}" will be hidden from clients and marked as archived.`}
        confirmLabel="Archive"
        danger={false}
        loading={archiveMutation.isPending}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />
    </AdminShell>
  )
}
