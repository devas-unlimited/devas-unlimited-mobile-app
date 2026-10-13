import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { AdminInput, AdminSelect, AdminTextarea, AdminToggle } from '../components/AdminFormField'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { ImageUploadField } from '../components/ImageUploadField'
import { useStagedUploads } from '../hooks/useStagedUploads'
import { deleteImages } from '@/services/storage'
import type { Announcement } from '@/types/database'

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  short_message: z.string().min(5, 'Short message required'),
  full_content: z.string().default(''),
  type: z.enum(['general','event_reminder','retreat','new_session','new_recording','schedule_change','important_notice']),
  priority: z.enum(['normal','important','urgent']),
  status: z.enum(['draft','scheduled','published','archived']),
  is_featured: z.boolean().default(false),
  is_dismissible: z.boolean().default(true),
  cta_label: z.string().default(''),
  cta_url: z.string().default(''),
  cover_image_url: z.string().default(''),
  published_at: z.string().default(''),
  expires_at: z.string().default(''),
})

type FormData = z.infer<typeof schema>

async function fetchAnnouncement(id: string): Promise<Announcement> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('announcements') as any).select('*').eq('id', id).single()
  if (error) throw error
  return data as Announcement
}

export function AdminAnnouncementFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const staged = useStagedUploads()

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'announcement', id],
    queryFn: () => fetchAnnouncement(id!),
    enabled: isEdit,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { type: 'general', priority: 'normal', status: 'draft', is_featured: false, is_dismissible: true },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        short_message: existing.short_message,
        full_content: existing.full_content ?? '',
        type: existing.type,
        priority: existing.priority,
        status: existing.status,
        is_featured: existing.is_featured,
        is_dismissible: existing.is_dismissible,
        cta_label: existing.cta_label ?? '',
        cta_url: existing.cta_url ?? '',
        cover_image_url: existing.cover_image_url ?? '',
        published_at: existing.published_at ? existing.published_at.slice(0, 16) : '',
        expires_at: existing.expires_at ? existing.expires_at.slice(0, 16) : '',
      })
    }
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const now = new Date().toISOString()
      const payload = {
        ...data,
        published_at: data.status === 'published'
          ? (data.published_at ? new Date(data.published_at).toISOString() : now)
          : (data.published_at ? new Date(data.published_at).toISOString() : null),
        expires_at: data.expires_at ? new Date(data.expires_at).toISOString() : null,
        cover_image_url: data.cover_image_url || null,
        updated_at: now,
        updated_by: user?.id,
        ...(isEdit ? {} : { created_by: user?.id }),
      }

      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('announcements') as any).update(payload).eq('id', id)
        if (error) throw error
        if ((existing?.cover_image_url ?? null) !== payload.cover_image_url) await deleteImages(existing?.cover_image_url)
        await logAdminAction(user!.id, 'update', 'announcement', id!, `Updated: ${data.title}`)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('announcements') as any).insert(payload)
        if (error) throw error
        await logAdminAction(user!.id, 'create', 'announcement', null, `Created announcement: ${data.title}`)
      }
      staged.commit(payload.cover_image_url)
    },
    onSuccess: () => {
      toast(isEdit ? 'Announcement updated' : 'Announcement created', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] })
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      navigate('/admin/announcements')
    },
    onError: (err: Error) => toast(err.message || 'Failed to save', 'error'),
  })

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/announcements')} className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#321B26]">{isEdit ? 'Edit Announcement' : 'New Announcement'}</h1>
        </div>
      </div>

      {isEdit && isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              <Card title="Content">
                <AdminInput label="Title" required {...register('title')} error={errors.title?.message} />
                <AdminTextarea label="Short message" required rows={2} {...register('short_message')} error={errors.short_message?.message} hint="Shown as preview in dashboard" />
                <AdminTextarea label="Full content" rows={6} {...register('full_content')} hint="Shown when user taps the announcement" />
              </Card>
              <Card title="Banner">
                <Controller name="cover_image_url" control={control} render={({ field }) => (
                  <ImageUploadField
                    label="Banner image"
                    hint="1200 × 600 • shown in Home highlights when Featured"
                    folder="announcements"
                    staged={staged}
                    value={field.value ?? ''}
                    onChange={url => field.onChange(url)}
                  />
                )} />
              </Card>
              <Card title="Call to action">
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Button label" placeholder="Learn more" {...register('cta_label')} />
                  <AdminInput label="Button URL" type="url" placeholder="https://…" {...register('cta_url')} />
                </div>
              </Card>
            </div>

            <div className="space-y-5">
              <Card title="Settings">
                <AdminSelect label="Type" {...register('type')} error={errors.type?.message}>
                  <option value="general">General</option>
                  <option value="event_reminder">Event reminder</option>
                  <option value="retreat">Retreat</option>
                  <option value="new_session">New session</option>
                  <option value="new_recording">New recording</option>
                  <option value="schedule_change">Schedule change</option>
                  <option value="important_notice">Important notice</option>
                </AdminSelect>
                <AdminSelect label="Priority" {...register('priority')}>
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </AdminSelect>
                <AdminSelect label="Status" {...register('status')}>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </AdminSelect>
                <AdminInput label="Publish at" type="datetime-local" {...register('published_at')} hint="Leave blank = now" />
                <AdminInput label="Expires at" type="datetime-local" {...register('expires_at')} hint="Leave blank = never" />
                <Controller name="is_featured" control={control} render={({ field }) => (
                  <AdminToggle label="Featured" description="Shown as a banner in Home highlights" checked={field.value} onChange={field.onChange} />
                )} />
                <Controller name="is_dismissible" control={control} render={({ field }) => (
                  <AdminToggle label="Dismissible" description="Clients can hide it" checked={field.value} onChange={field.onChange} />
                )} />
              </Card>
              <button
                type="submit"
                disabled={saveMutation.isPending || (!isDirty && isEdit)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create announcement'}
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
