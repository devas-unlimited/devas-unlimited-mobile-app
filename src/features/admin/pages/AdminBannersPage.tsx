import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { Plus, Edit2, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, RefreshCw, GalleryHorizontal, Info } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatusBadge } from '../components/StatusBadge'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { notifyContentChanged } from '@/services/realtime'
import { BannerSlide } from '@/components/banners/BannerSlide'
import { fetchAllBanners, bannerStatus } from '@/services/banners'
import { deleteImages } from '@/services/storage'
import type { HomeBanner } from '@/types/database'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const bannersTable = () => supabase.from('home_banners') as any

function scheduleText(b: HomeBanner) {
  const f = (d: string) => format(new Date(d), 'd MMM yyyy, h:mm aa')
  if (b.starts_at && b.ends_at) return `${f(b.starts_at)} → ${f(b.ends_at)}`
  if (b.starts_at) return `From ${f(b.starts_at)}`
  if (b.ends_at) return `Until ${f(b.ends_at)}`
  return 'Always on'
}

export function AdminBannersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const [deleteTarget, setDeleteTarget] = useState<HomeBanner | null>(null)

  const { data: banners = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'banners'],
    queryFn: fetchAllBanners,
    staleTime: 0,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] })
    queryClient.invalidateQueries({ queryKey: ['banners'] })
  }

  const moveMutation = useMutation({
    mutationFn: async ({ index, dir }: { index: number; dir: -1 | 1 }) => {
      const list = [...banners]
      const target = index + dir
      ;[list[index], list[target]] = [list[target], list[index]]
      // Re-number in steps of 10 so the order is always clean and unique
      const updates = list
        .map((b, i) => ({ id: b.id, display_order: (i + 1) * 10, changed: b.display_order !== (i + 1) * 10 }))
        .filter(u => u.changed)
      const results = await Promise.all(updates.map(u => bannersTable().update({ display_order: u.display_order }).eq('id', u.id)))
      const failed = results.find((r: { error: unknown }) => r.error)
      if (failed) throw failed.error
    },
    onSuccess: () => { notifyContentChanged('home_banner'); invalidate() },
    onError: () => toast('Could not reorder banners', 'error'),
  })

  const toggleMutation = useMutation({
    mutationFn: async (b: HomeBanner) => {
      const { error } = await bannersTable().update({ is_active: !b.is_active, updated_by: user?.id, updated_at: new Date().toISOString() }).eq('id', b.id)
      if (error) throw error
      await logAdminAction(user!.id, 'update', 'home_banner', b.id, `${b.is_active ? 'Hid' : 'Showed'} banner: ${b.title}`)
    },
    onSuccess: (_, b) => { toast(b.is_active ? 'Banner hidden' : 'Banner is visible', 'success'); invalidate() },
    onError: () => toast('Could not update banner', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: async (b: HomeBanner) => {
      const { error } = await bannersTable().delete().eq('id', b.id)
      if (error) throw error
      await deleteImages(b.image_url)
      await logAdminAction(user!.id, 'delete', 'home_banner', b.id, `Deleted banner: ${b.title}`)
    },
    onSuccess: () => { toast('Banner deleted', 'success'); setDeleteTarget(null); invalidate() },
    onError: () => toast('Could not delete banner', 'error'),
  })

  const liveCount = banners.filter(b => bannerStatus(b) === 'live').length

  return (
    <AdminShell>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Home Banners</h1>
          <p className="text-sm text-[#8C7B85] mt-0.5">{banners.length} banners • {liveCount} live in the app</p>
        </div>
        <button
          onClick={() => navigate('/admin/banners/new')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors"
        >
          <Plus size={16} /> New banner
        </button>
      </div>

      <div className="flex items-start gap-3 bg-[#FFF3D6] text-[#5C4A12] rounded-xl px-4 py-3 mb-6 text-xs leading-relaxed">
        <Info size={15} className="flex-shrink-0 mt-0.5" />
        <p>
          Banners appear in the <strong>Highlights</strong> slider on the app's Home screen, in the order below.
          Events and announcements marked <strong>Featured</strong> are added automatically after your banners.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#F0E6EC]">
          <p className="text-sm text-[#8C7B85] mb-3">Failed to load banners</p>
          <button onClick={() => refetch()} className="flex items-center gap-2 mx-auto text-xs text-[#7C2447] font-medium"><RefreshCw size={13} /> Try again</button>
        </div>
      ) : banners.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-[#F0E6EC]">
          <div className="w-12 h-12 rounded-2xl bg-[#E8DDF2] flex items-center justify-center mx-auto mb-3">
            <GalleryHorizontal size={20} className="text-[#7C2447]" />
          </div>
          <p className="text-sm text-[#8C7B85] mb-4">No banners yet</p>
          <button onClick={() => navigate('/admin/banners/new')} className="px-4 py-2 bg-[#7C2447] text-white rounded-xl text-sm font-medium">Create first banner</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {banners.map((b, i) => {
            const status = bannerStatus(b)
            return (
              <div key={b.id} className="bg-white rounded-2xl p-3 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] flex flex-col">
                <div className={status === 'live' ? '' : 'opacity-60'}>
                  <BannerSlide
                    preview
                    data={{ eyebrow: b.eyebrow, title: b.title, subtitle: b.subtitle, ctaLabel: b.cta_label, imageUrl: b.image_url, imageMode: b.image_mode, theme: b.theme, link: b.link_url }}
                  />
                </div>

                <div className="px-1 pt-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-bold text-[#C4B5BD]">#{i + 1}</span>
                      <p className="text-sm font-semibold text-[#321B26] truncate">{b.title}</p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                  </div>
                  <p className="text-[11px] text-[#8C7B85] mt-1">{scheduleText(b)}</p>
                  {b.link_url && <p className="text-[11px] text-[#C4B5BD] truncate mt-0.5">→ {b.link_url}</p>}
                </div>

                <div className="flex items-center gap-1.5 px-1 pt-3 mt-2 border-t border-[#F7F0E9]">
                  <IconButton label="Move up" disabled={i === 0 || moveMutation.isPending} onClick={() => moveMutation.mutate({ index: i, dir: -1 })}><ArrowUp size={13} /></IconButton>
                  <IconButton label="Move down" disabled={i === banners.length - 1 || moveMutation.isPending} onClick={() => moveMutation.mutate({ index: i, dir: 1 })}><ArrowDown size={13} /></IconButton>
                  <div className="flex-1" />
                  <IconButton label={b.is_active ? 'Hide banner' : 'Show banner'} disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate(b)}>
                    {b.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                  </IconButton>
                  <IconButton label="Edit banner" accent onClick={() => navigate(`/admin/banners/${b.id}`)}><Edit2 size={13} /></IconButton>
                  <IconButton label="Delete banner" danger onClick={() => setDeleteTarget(b)}><Trash2 size={13} /></IconButton>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this banner?"
        message={`"${deleteTarget?.title}" and its uploaded image will be permanently deleted. To keep it for later, hide it instead.`}
        confirmLabel="Delete"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </AdminShell>
  )
}

function IconButton({ label, onClick, disabled, accent, danger, children }: {
  label: string
  onClick: () => void
  disabled?: boolean
  accent?: boolean
  danger?: boolean
  children: React.ReactNode
}) {
  const tone = accent
    ? 'bg-[#E8DDF2] text-[#7C2447] hover:bg-[#7C2447] hover:text-white'
    : danger
      ? 'bg-[#F7F0E9] text-[#8C7B85] hover:bg-red-50 hover:text-red-500'
      : 'bg-[#F7F0E9] text-[#8C7B85] hover:text-[#7C2447]'
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:pointer-events-none ${tone}`}
    >
      {children}
    </button>
  )
}
