import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Archive, Search, Star, RefreshCw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import type { Resource } from '@/types/database'

const CATEGORY_ICONS: Record<string, string> = { watch: '🎬', listen: '🎧', meditate: '🧘', read: '📖' }

async function fetchAdminResources(filter: string, search: string): Promise<Resource[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = (supabase.from('resources') as any)
    .select('*')
    .order('created_at', { ascending: false })

  if (filter === 'published') q = q.eq('is_published', true)
  else if (filter === 'draft') q = q.eq('is_published', false)
  else if (filter !== 'all') q = q.eq('category', filter)

  if (search) q = q.ilike('title', `%${search}%`)
  const { data, error } = await q
  if (error) throw error
  return (data ?? []) as Resource[]
}

export function AdminResourcesPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [archiveTarget, setArchiveTarget] = useState<Resource | null>(null)

  const { data: items = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'resources', filter, search],
    queryFn: () => fetchAdminResources(filter, search),
    staleTime: 0,
  })

  const archiveMutation = useMutation({
    mutationFn: async (r: Resource) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('resources') as any)
        .update({ is_published: false, archived_at: new Date().toISOString() })
        .eq('id', r.id)
      if (error) throw error
      await logAdminAction(user!.id, 'archive', 'resource', r.id, `Archived resource: ${r.title}`)
    },
    onSuccess: () => {
      toast('Resource archived', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
      queryClient.invalidateQueries({ queryKey: ['sanctuary'] })
      setArchiveTarget(null)
    },
    onError: () => toast('Failed to archive', 'error'),
  })

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (r: Resource) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('resources') as any)
        .update({ is_featured: !r.is_featured })
        .eq('id', r.id)
      if (error) throw error
      await logAdminAction(user!.id, 'update', 'resource', r.id, `${r.is_featured ? 'Unfeatured' : 'Featured'} resource: ${r.title}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
      queryClient.invalidateQueries({ queryKey: ['sanctuary'] })
    },
  })

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Sanctuary Resources</h1>
          <p className="text-sm text-[#8C7B85] mt-0.5">{items.length} resources</p>
        </div>
        <button
          onClick={() => navigate('/admin/resources/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors"
        >
          <Plus size={16} /> Add resource
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'published', 'draft', 'watch', 'listen', 'meditate'].map(s => (
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
            <p className="text-sm text-[#8C7B85] mb-4">No resources found</p>
            <button onClick={() => navigate('/admin/resources/new')} className="px-4 py-2 bg-[#7C2447] text-white rounded-xl text-sm font-medium">Add first resource</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#F0E6EC]">
                  {['Title', 'Category', 'Provider', 'Duration', 'Status', 'Featured', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#8C7B85] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F7F0E9]">
                {items.map(r => (
                  <tr key={r.id} className="hover:bg-[#FCF7F0] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#321B26] truncate max-w-[200px]">{r.title}</p>
                      {r.description && <p className="text-xs text-[#8C7B85] truncate max-w-[200px]">{r.description}</p>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1.5 text-sm capitalize">
                        {CATEGORY_ICONS[r.category]} {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[#4A3540] whitespace-nowrap capitalize">{r.provider}</td>
                    <td className="px-4 py-3 text-[#8C7B85] whitespace-nowrap">{r.duration_minutes ? `${r.duration_minutes}m` : '—'}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={r.is_published ? 'published' : 'draft'} size="sm" /></td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleFeaturedMutation.mutate(r)}
                        aria-label={r.is_featured ? 'Unfeature' : 'Feature'}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${r.is_featured ? 'bg-[#FFF3D6] text-[#E6B74B]' : 'bg-[#F7F0E9] text-[#C4B5BD] hover:text-[#E6B74B]'}`}
                      >
                        <Star size={14} fill={r.is_featured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/resources/${r.id}`)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#E8DDF2] text-[#7C2447] hover:bg-[#7C2447] hover:text-white transition-colors"
                          aria-label="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        {r.is_published && (
                          <button
                            onClick={() => setArchiveTarget(r)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F7F0E9] text-[#8C7B85] hover:bg-red-50 hover:text-red-500 transition-colors"
                            aria-label="Archive"
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
        title="Archive this resource?"
        message={`"${archiveTarget?.title}" will be hidden from clients.`}
        confirmLabel="Archive"
        loading={archiveMutation.isPending}
        onConfirm={() => archiveTarget && archiveMutation.mutate(archiveTarget)}
        onCancel={() => setArchiveTarget(null)}
      />
    </AdminShell>
  )
}
