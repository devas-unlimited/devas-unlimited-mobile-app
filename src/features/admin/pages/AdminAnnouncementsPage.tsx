import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Archive, Trash2, Search, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { deleteImages } from '@/services/storage'
import type { Announcement } from '@/types/database'

const PRIORITY_COLOR: Record<string, string> = {
  normal: '#8C7B85',
  important: '#E6B74B',
  urgent: '#C0392B',
}

async function fetchAdminAnnouncements(filter: string, search: string): Promise<Announcement[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('announcements') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (filter !== 'all') q = q.eq('status', filter)
  if (search) q = q.ilike('title', `%${search}%`)

  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Announcement[]
}

export function AdminAnnouncementsPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<Announcement | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null)

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'announcements', filter, search],
    queryFn: () => fetchAdminAnnouncements(filter, search),
    staleTime: 0,
  })

  const archiveMutation = useMutation({
    mutationFn: async (ann: Announcement) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('announcements') as any)
        .update({ status: 'archived', updated_at: new Date().toISOString() })
        .eq('id', ann.id)
      if (error) throw error
      await logAdminAction(user!.id, 'archive', 'announcement', ann.id, `Archived announcement: ${ann.title}`)
    },
    onSuccess: () => {
      toast('Announcement archived', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setArchiveTarget(null)
    },
    onError: () => toast('Failed to archive', 'error'),
  })

  const publishMutation = useMutation({
    mutationFn: async (ann: Announcement) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('announcements') as any)
        .update({ status: 'published', published_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', ann.id)
      if (error) throw error
      await logAdminAction(user!.id, 'publish', 'announcement', ann.id, `Published announcement: ${ann.title}`)
    },
    onSuccess: () => {
      toast('Announcement published', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
    onError: () => toast('Failed to publish', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (ann: Announcement) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('announcements') as any).delete().eq('id', ann.id)
      if (error) throw error
      await deleteImages(ann.cover_image_url)
      await logAdminAction(user!.id, 'delete', 'announcement', ann.id, `Deleted announcement: ${ann.title}`)
    },
    onSuccess: () => {
      toast('Announcement deleted', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      setDeleteTarget(null)
    },
    onError: () => toast('Failed to delete', 'error'),
  })

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Announcements</h1>
          <p className="text-sm text-[#8C7B85] mt-0.5">{items.length} items</p>
        </div>
        <button
          onClick={() => navigate('/admin/announcements/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors"
        >
          <Plus size={16} /> New announcement
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search announcements…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'draft', 'published', 'scheduled', 'archived'].map(s => (
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
        ) : items.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[#8C7B85] mb-4">No announcements found</p>
            <button onClick={() => navigate('/admin/announcements/new')} className="px-4 py-2 bg-[#7C2447] text-white rounded-xl text-sm font-medium">Create first</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E6EC]">
                  {['Title', 'Type', 'Priority', 'Published', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8C7B85] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0E9]">
                {items.map(ann => (
                  <tr key={ann.id} className="hover:bg-[#FCF7F0] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#321B26] truncate max-w-[220px]">{ann.title}</p>
                      <p className="text-xs text-[#8C7B85] truncate max-w-[220px]">{ann.short_message}</p>
                    </td>
                    <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap capitalize">{ann.type.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold capitalize" style={{ color: PRIORITY_COLOR[ann.priority] }}>{ann.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-[#8C7B85] text-xs whitespace-nowrap">
                      {ann.published_at ? format(new Date(ann.published_at), 'dd MMM yy') : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={ann.status} size="sm" /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ann.status === 'draft' && (
                          <button
                            onClick={() => publishMutation.mutate(ann)}
                            disabled={publishMutation.isPending}
                            className="px-2.5 py-1 bg-[#DDE9D3] text-[#2D6B4A] rounded-lg text-xs font-semibold hover:bg-[#c8ddb7] transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/admin/announcements/${ann.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8DDF2] text-[#7C2447] hover:bg-[#7C2447] hover:text-white transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        {ann.status !== 'archived' && (
                          <button
                            onClick={() => setArchiveTarget(ann)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0E9] text-[#8C7B85] hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Archive"
                          >
                            <Archive size={13} />
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(ann)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0E9] text-[#8C7B85] hover:bg-red-50 hover:text-red-500 transition-colors"
                          aria-label="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
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
        title="Archive this announcement?"
        message={`"${archiveTarget?.title}" will be hidden from clients.`}
        confirmLabel="Archive"
        loading={archiveMutation.isPending}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this announcement?"
        message={`"${deleteTarget?.title}" will be permanently deleted, along with any uploaded image. To keep it for later, archive it instead.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  )
}
