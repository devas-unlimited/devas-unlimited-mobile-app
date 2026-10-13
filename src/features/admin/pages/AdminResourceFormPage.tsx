import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Wand2, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { AdminInput, AdminSelect, AdminTextarea, AdminToggle } from '../components/AdminFormField'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { fetchYouTubeDetails, youtubeId, resourceThumbnail } from '@/services/sanctuary'
import type { Resource } from '@/types/database'

const TOPIC_SUGGESTIONS = ['Satsang', 'Kirtan', 'Chants', 'Practice', 'Podcast', 'Meditation']

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  category: z.enum(['watch', 'listen', 'meditate']),
  provider: z.string().min(1, 'Provider required'),
  external_url: z.string().url('Must be a valid URL'),
  thumbnail_url: z.string().default(''),
  duration_minutes: z.number().int().positive().nullable().default(null),
  track_count: z.number().int().nonnegative().nullable().default(null),
  description: z.string().default(''),
  facilitator_name: z.string().default(''),
  topic: z.string().trim().default(''),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
})

type FormData = z.infer<typeof schema>

async function fetchResource(id: string): Promise<Resource> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('resources') as any).select('*').eq('id', id).single()
  if (error) throw error
  return data as Resource
}

export function AdminResourceFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'resource', id],
    queryFn: () => fetchResource(id!),
    enabled: isEdit,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, watch, setValue, getValues, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { category: 'watch', is_featured: false, is_published: false },
  })
  const [fetching, setFetching] = useState(false)
  const url = watch('external_url') ?? ''
  const thumbnail = watch('thumbnail_url') ?? ''
  const videoId = youtubeId(url)
  const preview = resourceThumbnail({ thumbnail_url: thumbnail || null, external_url: url })

  // Fills any empty fields from YouTube; description & duration still come from the video page
  async function fillFromYouTube() {
    setFetching(true)
    try {
      const d = await fetchYouTubeDetails(url)
      const opts = { shouldDirty: true, shouldValidate: true }
      const fillIfEmpty = (field: 'title' | 'facilitator_name' | 'thumbnail_url', value: string) => {
        if (!getValues(field)?.trim()) setValue(field, value, opts)
      }
      setValue('external_url', `https://www.youtube.com/watch?v=${videoId}`, opts)
      setValue('provider', 'youtube', opts)
      setValue('category', 'watch', opts)
      fillIfEmpty('title', d.title)
      fillIfEmpty('facilitator_name', d.author === 'DevasUnlimited' ? 'Devas Unlimited' : d.author)
      fillIfEmpty('thumbnail_url', d.thumbnailUrl)
      toast('Details filled from YouTube — add the description and duration', 'success')
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Could not reach YouTube', 'error')
    } finally {
      setFetching(false)
    }
  }

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        category: existing.category,
        provider: existing.provider,
        external_url: existing.external_url,
        thumbnail_url: existing.thumbnail_url ?? '',
        duration_minutes: existing.duration_minutes ?? null,
        track_count: existing.track_count ?? null,
        description: existing.description ?? '',
        facilitator_name: existing.facilitator_name ?? '',
        topic: existing.tags?.[0] ?? '',
        is_featured: existing.is_featured,
        is_published: existing.is_published,
      })
    }
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: async ({ topic, ...data }: FormData) => {
      const payload = {
        ...data,
        tags: topic ? [topic] : [],
        // Keep the original date on edits so videos stay in release order
        published_at: data.is_published ? (existing?.published_at ?? new Date().toISOString()) : null,
        updated_at: new Date().toISOString(),
        updated_by: user?.id,
        ...(isEdit ? {} : { created_by: user?.id }),
      }
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('resources') as any).update(payload).eq('id', id)
        if (error) throw error
        await logAdminAction(user!.id, 'update', 'resource', id!, `Updated resource: ${data.title}`)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('resources') as any).insert(payload)
        if (error) throw error
        await logAdminAction(user!.id, 'create', 'resource', null, `Created resource: ${data.title}`)
      }
    },
    onSuccess: () => {
      toast(isEdit ? 'Resource updated' : 'Resource created', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
      queryClient.invalidateQueries({ queryKey: ['sanctuary'] })
      navigate('/admin/resources')
    },
    onError: (err: Error) => toast(err.message || 'Failed to save', 'error'),
  })

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/resources')} className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-[#321B26]">{isEdit ? 'Edit Resource' : 'Add Resource'}</h1>
      </div>

      {isEdit && isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card title="Resource details">
                <AdminInput label="Title" required {...register('title')} error={errors.title?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect label="Category" required {...register('category')} error={errors.category?.message}>
                    <option value="watch">🎬 Watch</option>
                    <option value="listen">🎧 Listen</option>
                    <option value="meditate">🧘 Meditate</option>
                  </AdminSelect>
                  <AdminSelect label="Provider" required {...register('provider')} error={errors.provider?.message}>
                    <option value="">Select…</option>
                    {['youtube', 'vimeo', 'soundcloud', 'spotify', 'meditation', 'other'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </AdminSelect>
                </div>
                <div>
                  <AdminInput
                    label="External URL"
                    type="url"
                    required
                    placeholder="https://youtu.be/… or https://soundcloud.com/…"
                    hint={videoId ? 'Opens on YouTube, so plays count as channel views' : 'SoundCloud playlists (…/sets/…) open in-app with the full tracklist'}
                    {...register('external_url')}
                    error={errors.external_url?.message}
                  />
                  {videoId && (
                    <button
                      type="button"
                      onClick={fillFromYouTube}
                      disabled={fetching}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FDECEA] text-[#C0392B] text-xs font-semibold hover:bg-[#fbdcd8] transition-colors disabled:opacity-60"
                    >
                      {fetching ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                      {fetching ? 'Fetching…' : 'Fill title, presenter & thumbnail from YouTube'}
                    </button>
                  )}
                </div>
                <AdminTextarea
                  label="Description"
                  rows={videoId ? 6 : 3}
                  hint={videoId ? 'Paste from YouTube — the app shows a preview with “Read more”' : undefined}
                  {...register('description')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Facilitator / presenter" {...register('facilitator_name')} />
                  <AdminInput label="Topic" placeholder="e.g. Satsang" list="resource-topics" hint="Shown as a label & filter" {...register('topic')} />
                  <datalist id="resource-topics">
                    {TOPIC_SUGGESTIONS.map(t => <option key={t} value={t} />)}
                  </datalist>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Duration (minutes)" type="number" {...register('duration_minutes', { setValueAs: v => (v === '' || v == null ? null : Number(v)) })} />
                  <AdminInput label="Tracks (playlists)" type="number" min={0} {...register('track_count', { setValueAs: v => (v === '' || v == null ? null : Number(v)) })} />
                </div>
                <AdminInput
                  label="Thumbnail URL"
                  type="url"
                  placeholder="https://…"
                  hint={videoId ? 'Leave empty to use the YouTube thumbnail' : undefined}
                  {...register('thumbnail_url')}
                />
                {preview && (
                  <img src={preview} alt="Thumbnail preview" className={`rounded-xl object-cover border border-[#F0E6EC] ${videoId ? 'w-full max-w-sm aspect-video' : 'w-32 h-32'}`} />
                )}
              </Card>
            </div>
            <div className="space-y-5">
              <Card title="Publication">
                <Controller name="is_published" control={control} render={({ field }) => (
                  <AdminToggle label="Published" description="Visible to clients in Sanctuary" checked={field.value} onChange={field.onChange} />
                )} />
                <Controller name="is_featured" control={control} render={({ field }) => (
                  <AdminToggle label="Featured" description="Shown as the hero card" checked={field.value} onChange={field.onChange} />
                )} />
              </Card>
              <button
                type="submit"
                disabled={saveMutation.isPending || (!isDirty && isEdit)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add resource'}
              </button>
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
