import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Check, Smartphone } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { AdminInput, AdminSelect, AdminToggle } from '../components/AdminFormField'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { BannerSlide } from '@/components/banners/BannerSlide'
import { ImageUploadField } from '../components/ImageUploadField'
import { useStagedUploads } from '../hooks/useStagedUploads'
import { deleteImages } from '@/services/storage'
import { BANNER_THEMES, fetchAllBanners, isExternalLink } from '@/services/banners'
import type { BannerTheme, HomeBanner } from '@/types/database'

const APP_DESTINATIONS = [
  { path: '/events', label: 'Events & Announcements' },
  { path: '/sanctuary', label: 'Sanctuary' },
  { path: '/meditate', label: 'Meditate' },
  { path: '/journey', label: 'My Journey' },
  { path: '/sessions', label: 'My Sessions' },
]

const THEME_KEYS = Object.keys(BANNER_THEMES) as BannerTheme[]

const schema = z.object({
  eyebrow: z.string().max(40, 'Keep it under 40 characters').default(''),
  title: z.string().min(2, 'Title is required').max(80, 'Keep it under 80 characters'),
  subtitle: z.string().max(120, 'Keep it under 120 characters').default(''),
  cta_label: z.string().max(30, 'Keep it under 30 characters').default(''),
  image_url: z.string().default('').refine(v => !v || /^(https?:\/\/|\/)/.test(v), 'Must start with https:// (or / for app images)'),
  image_mode: z.enum(['cover', 'side']),
  theme: z.enum(THEME_KEYS as [BannerTheme, ...BannerTheme[]]),
  link_type: z.enum(['none', 'app', 'external']),
  app_path: z.string().default('/events'),
  external_url: z.string().default(''),
  starts_at: z.string().default(''),
  ends_at: z.string().default(''),
  is_active: z.boolean().default(true),
}).superRefine((d, ctx) => {
  if (d.link_type === 'external' && !isExternalLink(d.external_url)) {
    ctx.addIssue({ code: 'custom', path: ['external_url'], message: 'Enter a full link starting with https://' })
  }
  if (d.starts_at && d.ends_at && new Date(d.ends_at) <= new Date(d.starts_at)) {
    ctx.addIssue({ code: 'custom', path: ['ends_at'], message: 'End must be after start' })
  }
})

type FormData = z.infer<typeof schema>

const toLocalInput = (iso: string | null) => (iso ? format(new Date(iso), "yyyy-MM-dd'T'HH:mm") : '')
const toIso = (local: string) => (local ? new Date(local).toISOString() : null)

function linkFields(link: string | null): Pick<FormData, 'link_type' | 'app_path' | 'external_url'> {
  if (!link) return { link_type: 'none', app_path: '/events', external_url: '' }
  if (isExternalLink(link)) return { link_type: 'external', app_path: '/events', external_url: link }
  return { link_type: 'app', app_path: link, external_url: '' }
}

async function fetchBanner(id: string): Promise<HomeBanner> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('home_banners') as any).select('*').eq('id', id).single()
  if (error) throw error
  return data as HomeBanner
}

export function AdminBannerFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const staged = useStagedUploads()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'banner', id],
    queryFn: () => fetchBanner(id!),
    enabled: isEdit,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, watch, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      eyebrow: '', title: '', subtitle: '', cta_label: 'Learn more', image_url: '',
      image_mode: 'cover', theme: 'plum', link_type: 'none', app_path: '/events', external_url: '',
      starts_at: '', ends_at: '', is_active: true,
    },
  })

  useEffect(() => {
    if (!existing) return
    reset({
      eyebrow: existing.eyebrow ?? '',
      title: existing.title,
      subtitle: existing.subtitle ?? '',
      cta_label: existing.cta_label ?? '',
      image_url: existing.image_url ?? '',
      image_mode: existing.image_mode,
      theme: existing.theme,
      ...linkFields(existing.link_url),
      starts_at: toLocalInput(existing.starts_at),
      ends_at: toLocalInput(existing.ends_at),
      is_active: existing.is_active,
    })
  }, [existing, reset])

  const v = watch()
  const linkUrl = v.link_type === 'app' ? v.app_path : v.link_type === 'external' ? v.external_url : null

  const saveMutation = useMutation({
    mutationFn: async (d: FormData) => {
      const payload = {
        eyebrow: d.eyebrow || null,
        title: d.title,
        subtitle: d.subtitle || null,
        cta_label: d.cta_label || null,
        image_url: d.image_url || null,
        image_mode: d.image_mode,
        theme: d.theme,
        link_url: d.link_type === 'app' ? d.app_path : d.link_type === 'external' ? d.external_url : null,
        starts_at: toIso(d.starts_at),
        ends_at: toIso(d.ends_at),
        is_active: d.is_active,
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const table = supabase.from('home_banners') as any
      if (isEdit) {
        const { error } = await table.update(payload).eq('id', id)
        if (error) throw error
        // The old image was replaced or removed — delete it from storage too
        if (existing?.image_url !== payload.image_url) await deleteImages(existing?.image_url)
        await logAdminAction(user!.id, 'update', 'home_banner', id!, `Updated banner: ${d.title}`)
      } else {
        // New banners go to the end of the slider
        const all = await fetchAllBanners()
        const display_order = all.reduce((max, b) => Math.max(max, b.display_order), 0) + 10
        const { data: created, error } = await table.insert({ ...payload, display_order, created_by: user?.id }).select('id').single()
        if (error) throw error
        await logAdminAction(user!.id, 'create', 'home_banner', created.id, `Created banner: ${d.title}`)
      }
      staged.commit(payload.image_url)
    },
    onSuccess: () => {
      toast(isEdit ? 'Banner updated' : 'Banner created', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'banners'] })
      queryClient.invalidateQueries({ queryKey: ['banners'] })
      navigate('/admin/banners')
    },
    onError: (err: Error) => toast(err.message || 'Failed to save banner', 'error'),
  })

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/banners')}
          className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#321B26]">{isEdit ? 'Edit Banner' : 'New Banner'}</h1>
          <p className="text-xs text-[#8C7B85]">Shown in the Highlights slider on the app's Home screen</p>
        </div>
      </div>

      {isEdit && isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              <Card title="Content">
                <AdminInput label="Small label" placeholder="e.g. New retreat, Limited seats" hint="optional" {...register('eyebrow')} error={errors.eyebrow?.message} />
                <AdminInput label="Title" required placeholder="e.g. Kannur Mystic Retreat" {...register('title')} error={errors.title?.message} />
                <AdminInput label="Subtitle" placeholder="One short line" hint="optional" {...register('subtitle')} error={errors.subtitle?.message} />
              </Card>

              <Card title="Look">
                <Controller name="image_url" control={control} render={({ field }) => (
                  <ImageUploadField
                    label="Image"
                    hint={v.image_mode === 'side' ? 'logo / product, transparent PNG ideal' : '1200 × 600 recommended'}
                    folder="banners"
                    staged={staged}
                    value={field.value}
                    onChange={url => field.onChange(url)}
                    contain={v.image_mode === 'side'}
                    error={errors.image_url?.message}
                  />
                )} />
                <Controller name="image_mode" control={control} render={({ field }) => (
                  <div>
                    <p className="text-xs font-semibold text-[#4A3540] uppercase tracking-wide mb-1.5">Image style</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([['cover', 'Cover', 'Photo fills the banner'], ['side', 'Side image', 'Logo / product on the right']] as const).map(([val, label, desc]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => field.onChange(val)}
                          aria-pressed={field.value === val}
                          className={`text-left p-3 rounded-xl border transition-colors ${field.value === val ? 'border-[#7C2447] bg-[#7C2447]/5' : 'border-[#E8DDF2] hover:border-[#7C2447]/40'}`}
                        >
                          <p className="text-sm font-semibold text-[#321B26]">{label}</p>
                          <p className="text-[11px] text-[#8C7B85]">{desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )} />
                <Controller name="theme" control={control} render={({ field }) => (
                  <div>
                    <p className="text-xs font-semibold text-[#4A3540] uppercase tracking-wide mb-1.5">Colour theme <span className="normal-case font-normal text-[#C4B5BD]">— used when there's no cover image</span></p>
                    <div className="flex flex-wrap gap-3">
                      {THEME_KEYS.map(key => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => field.onChange(key)}
                          aria-pressed={field.value === key}
                          aria-label={BANNER_THEMES[key].label}
                          className="flex flex-col items-center gap-1"
                        >
                          <span
                            className={`w-10 h-10 rounded-full flex items-center justify-center ring-offset-2 transition-shadow ${field.value === key ? 'ring-2 ring-[#7C2447]' : 'ring-1 ring-[#E8DDF2]'}`}
                            style={{ background: BANNER_THEMES[key].background }}
                          >
                            {field.value === key && <Check size={16} className={BANNER_THEMES[key].dark ? 'text-white' : 'text-[#4A2338]'} />}
                          </span>
                          <span className="text-[10px] text-[#8C7B85]">{BANNER_THEMES[key].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )} />
              </Card>

              <Card title="Button & link">
                <AdminInput label="Button text" placeholder="e.g. Register now" hint="leave empty for no button" {...register('cta_label')} error={errors.cta_label?.message} />
                <AdminSelect label="When tapped" {...register('link_type')}>
                  <option value="none">Do nothing</option>
                  <option value="app">Open a screen in the app</option>
                  <option value="external">Open a website</option>
                </AdminSelect>
                {v.link_type === 'app' && (
                  <AdminSelect label="App screen" {...register('app_path')}>
                    {APP_DESTINATIONS.map(d => <option key={d.path} value={d.path}>{d.label}</option>)}
                  </AdminSelect>
                )}
                {v.link_type === 'external' && (
                  <AdminInput label="Website link" type="url" placeholder="https://…" {...register('external_url')} error={errors.external_url?.message} />
                )}
              </Card>

              <Card title="Schedule">
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Show from" type="datetime-local" hint="blank = now" {...register('starts_at')} error={errors.starts_at?.message} />
                  <AdminInput label="Show until" type="datetime-local" hint="blank = always" {...register('ends_at')} error={errors.ends_at?.message} />
                </div>
                <Controller name="is_active" control={control} render={({ field }) => (
                  <AdminToggle label="Visible" description="Turn off to hide this banner without deleting it" checked={field.value} onChange={field.onChange} />
                )} />
              </Card>
            </div>

            {/* Live preview */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-6 space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
                  <div className="flex items-center gap-2 mb-4">
                    <Smartphone size={15} className="text-[#7C2447]" />
                    <h2 className="text-sm font-bold text-[#321B26]">Live preview</h2>
                  </div>
                  <div className="mx-auto max-w-[360px] bg-[#FCF7F0] rounded-[28px] p-4">
                    <p className="text-sm font-bold text-[#321B26] mb-3">Highlights</p>
                    <BannerSlide
                      preview
                      data={{ eyebrow: v.eyebrow, title: v.title, subtitle: v.subtitle, ctaLabel: v.cta_label, imageUrl: v.image_url, imageMode: v.image_mode, theme: v.theme, link: linkUrl }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saveMutation.isPending || (isEdit && !isDirty)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create banner'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
      <h2 className="text-sm font-bold text-[#321B26] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
