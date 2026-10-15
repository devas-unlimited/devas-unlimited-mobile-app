import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, Globe } from 'lucide-react'
import { format } from 'date-fns'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { AdminInput, AdminSelect, AdminTextarea, AdminToggle } from '../components/AdminFormField'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import { EVENT_CATEGORIES, EVENT_FORMATS } from '@/services/events'
import { ImageUploadField } from '../components/ImageUploadField'
import { useStagedUploads } from '../hooks/useStagedUploads'
import { deleteImages } from '@/services/storage'

const schema = z.object({
  title: z.string().min(2, 'Title is required'),
  slug: z.string().min(2, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug: lowercase letters, numbers and hyphens only'),
  category: z.enum(EVENT_CATEGORIES, { message: 'Type is required' }),
  format: z.enum(EVENT_FORMATS, { message: 'Format is required' }),
  status: z.enum(['draft', 'scheduled', 'published', 'archived', 'cancelled']),
  start_date: z.string().min(1, 'Start date is required'),
  start_time: z.string().default(''),
  end_date: z.string().default(''),
  end_time: z.string().default(''),
  city: z.string().default(''),
  venue: z.string().default(''),
  address: z.string().default(''),
  meeting_url: z.string().default(''),
  registration_url: z.string().default(''),
  description: z.string().default(''),
  facilitator_name: z.string().default(''),
  cover_image_url: z.string().default(''),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(false),
  registration_open: z.boolean().default(true),
}).refine(d => !d.end_date || d.end_date >= d.start_date, {
  message: 'End date must be on or after the start date',
  path: ['end_date'],
})

type FormData = z.infer<typeof schema>

async function fetchEvent(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('events') as any).select('*').eq('id', id).single()
  if (error) throw error
  return data as Record<string, unknown>
}

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function AdminEventFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()
  const staged = useStagedUploads()

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['admin', 'event', id],
    queryFn: () => fetchEvent(id!),
    enabled: isEdit,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, watch, setValue, reset, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      category: 'Event',
      format: 'In-person',
      status: 'draft',
      is_featured: false,
      is_published: false,
      registration_open: true,
    },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: (existing.title as string) ?? '',
        slug: (existing.slug as string) ?? '',
        category: (existing.category as FormData['category']) ?? 'Event',
        format: (existing.format as FormData['format']) ?? 'In-person',
        status: (existing.status as FormData['status']) ?? 'draft',
        start_date: existing.starts_at ? format(new Date(existing.starts_at as string), 'yyyy-MM-dd') : '',
        start_time: existing.starts_at && !existing.all_day ? format(new Date(existing.starts_at as string), 'HH:mm') : '',
        end_date: existing.ends_at ? format(new Date(existing.ends_at as string), 'yyyy-MM-dd') : '',
        end_time: existing.ends_at && format(new Date(existing.ends_at as string), 'HH:mm') !== '23:59'
          ? format(new Date(existing.ends_at as string), 'HH:mm') : '',
        city: (existing.city as string) ?? '',
        venue: (existing.venue as string) ?? '',
        address: (existing.address as string) ?? '',
        meeting_url: (existing.meeting_url as string) ?? '',
        registration_url: (existing.registration_url as string) ?? '',
        description: (existing.description as string) ?? '',
        facilitator_name: (existing.facilitator_name as string) ?? '',
        cover_image_url: (existing.cover_image_url as string) ?? '',
        is_featured: Boolean(existing.is_featured),
        is_published: Boolean(existing.is_published),
        registration_open: existing.registration_open !== false,
      })
    }
  }, [existing, reset])

  const title = watch('title')
  useEffect(() => {
    if (!isEdit && title) setValue('slug', slugify(title))
  }, [title, isEdit, setValue])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // A start date without a time is an all-day event; it stays live until end of day
      const allDay = !data.start_time
      const startsAt = new Date(`${data.start_date}T${data.start_time || '00:00'}`)
      const endsAt = data.end_date
        ? new Date(`${data.end_date}T${data.end_time || '23:59'}`)
        : allDay ? new Date(`${data.start_date}T23:59`) : null

      const { start_date: _sd, start_time: _st, end_date: _ed, end_time: _et, ...fields } = data
      const payload = {
        ...fields,
        capacity: null,
        price: null,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt ? endsAt.toISOString() : null,
        all_day: allDay,
        cover_image_url: data.cover_image_url || null,
        is_published: data.status === 'published',
        published_at: data.status === 'published' ? new Date().toISOString() : null,
        updated_by: user?.id,
        ...(isEdit ? {} : { created_by: user?.id }),
      }

      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('events') as any).update(payload).eq('id', id)
        if (error) throw error
        const previousCover = (existing?.cover_image_url as string | null) ?? null
        if (previousCover !== payload.cover_image_url) await deleteImages(previousCover)
        await logAdminAction(user!.id, 'update', 'event', id!, `Updated event: ${data.title}`)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('events') as any).insert(payload)
        if (error) throw error
        await logAdminAction(user!.id, 'create', 'event', null, `Created event: ${data.title}`)
      }
      staged.commit(payload.cover_image_url)
    },
    onSuccess: () => {
      toast(isEdit ? 'Event updated' : 'Event created', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'events'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      navigate('/admin/events')
    },
    onError: (err: Error) => toast(err.message || 'Failed to save event', 'error'),
  })

  const isLoading = isEdit && loadingExisting

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors"
          aria-label="Back"
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-[#321B26]">{isEdit ? 'Edit Event' : 'New Event'}</h1>
          <p className="text-xs text-[#8C7B85]">{isEdit ? 'Update event details' : 'Create a new event or retreat'}</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main fields */}
            <div className="lg:col-span-2 space-y-5">
              <Section title="Basic information">
                <AdminInput label="Title" required {...register('title')} error={errors.title?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Slug" required {...register('slug')} error={errors.slug?.message} hint="auto-generated" />
                  <AdminSelect label="Type" required {...register('category')} error={errors.category?.message} hint="app tab">
                    {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </AdminSelect>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect label="Format" required {...register('format')} error={errors.format?.message}>
                    {EVENT_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
                  </AdminSelect>
                  <AdminInput label="Facilitator" {...register('facilitator_name')} error={errors.facilitator_name?.message} />
                </div>
                <AdminTextarea label="Description" {...register('description')} error={errors.description?.message} rows={4} />
              </Section>

              <Section title="Date & time">
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Start date" type="date" required {...register('start_date')} error={errors.start_date?.message} />
                  <AdminInput label="Start time" type="time" hint="optional" {...register('start_time')} error={errors.start_time?.message} />
                  <AdminInput label="End date" type="date" hint="for multi-day" {...register('end_date')} error={errors.end_date?.message} />
                  <AdminInput label="End time" type="time" hint="optional" {...register('end_time')} error={errors.end_time?.message} />
                </div>
                <p className="text-xs text-[#8C7B85] -mt-1">Leave the time blank to show just the date, with no clock time.</p>
              </Section>

              <Section title="Location">
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="City" {...register('city')} error={errors.city?.message} />
                  <AdminInput label="Venue" {...register('venue')} error={errors.venue?.message} />
                </div>
                <AdminInput label="Address" {...register('address')} error={errors.address?.message} />
                <AdminInput label="Online meeting URL" type="url" placeholder="https://zoom.us/…" {...register('meeting_url')} error={errors.meeting_url?.message} />
              </Section>

              <Section title="Registration">
                <AdminInput label="Registration URL" type="url" placeholder="https://…" {...register('registration_url')} error={errors.registration_url?.message} />
              </Section>

              <Section title="Media">
                <Controller name="cover_image_url" control={control} render={({ field }) => (
                  <ImageUploadField
                    label="Cover image"
                    hint="1200 × 600 recommended • used in Home highlights"
                    folder="events"
                    staged={staged}
                    value={field.value ?? ''}
                    onChange={url => field.onChange(url)}
                    error={errors.cover_image_url?.message}
                  />
                )} />
              </Section>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <Section title="Publication">
                <AdminSelect label="Status" required {...register('status')} error={errors.status?.message}>
                  <option value="draft">Draft</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                  <option value="cancelled">Cancelled</option>
                </AdminSelect>
                <Controller
                  name="is_featured"
                  control={control}
                  render={({ field }) => (
                    <AdminToggle
                      label="Featured on Home"
                      description="Shown as a banner in Home highlights (uses the cover image)"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                <Controller
                  name="registration_open"
                  control={control}
                  render={({ field }) => (
                    <AdminToggle
                      label="Registration open"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Section>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={saveMutation.isPending || (!isDirty && isEdit)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors disabled:opacity-50"
                >
                  <Save size={15} />
                  {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create event'}
                </button>

                <a
                  href="/events"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-[#E8DDF2] text-[#4A3540] rounded-xl text-sm font-medium hover:bg-[#FCF7F0] transition-colors"
                >
                  <Globe size={14} /> Preview in app
                </a>
              </div>
            </div>
          </div>
        </form>
      )}
    </AdminShell>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
      <h2 className="text-sm font-bold text-[#321B26] mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  )
}
