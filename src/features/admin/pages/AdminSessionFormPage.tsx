import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Save, UserPlus, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { AdminInput, AdminSelect, AdminToggle } from '../components/AdminFormField'
import { useToast } from '@/components/feedback/Toast'
import { useAuth } from '@/features/auth/AuthContext'
import { logAdminAction } from '../services/adminLog'
import type { ClientSession, SessionParticipant, Profile } from '@/types/database'

const schema = z.object({
  title: z.string().min(2, 'Title required'),
  session_kind: z.enum(['1on1', 'group']),
  session_type: z.enum(['1on1','group','coaching','meditation','breathwork','akashic','counselling','energy_healing','other']),
  coach_name: z.string().default(''),
  starts_at: z.string().min(1, 'Date required'),
  duration_minutes: z.number().int().positive().nullable().default(60),
  status: z.enum(['scheduled', 'completed', 'cancelled']),
  meeting_url: z.string().default(''),
  recording_url: z.string().default(''),
  recording_provider: z.string().default(''),
  recording_status: z.enum(['none', 'processing', 'available', 'expired']),
  is_private: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

type SessionDetail = ClientSession & { session_participants: (SessionParticipant & { profiles: Profile | null })[] }

async function fetchSession(id: string): Promise<SessionDetail> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from('client_sessions') as any)
    .select('*, session_participants(*, profiles(id, full_name, avatar_url))')
    .eq('id', id)
    .single()
  if (error) throw error
  return data as SessionDetail
}

async function fetchAllClients(): Promise<Profile[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase.from('profiles') as any)
    .select('id, full_name, avatar_url')
    .eq('role', 'client')
    .order('full_name')
  return (data ?? []) as Profile[]
}

export function AdminSessionFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id && id !== 'new')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user } = useAuth()

  const [selectedClients, setSelectedClients] = useState<{ id: string; name: string }[]>([])
  const [clientSearch, setClientSearch] = useState('')

  const { data: existing, isLoading } = useQuery({
    queryKey: ['admin', 'session', id],
    queryFn: () => fetchSession(id!),
    enabled: isEdit,
  })

  const { data: allClients = [] } = useQuery({
    queryKey: ['admin', 'clients-list'],
    queryFn: fetchAllClients,
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { session_kind: '1on1', session_type: 'coaching', status: 'scheduled', recording_status: 'none', is_private: true, duration_minutes: 60 },
  })

  useEffect(() => {
    if (existing) {
      reset({
        title: existing.title,
        session_kind: existing.session_kind,
        session_type: (existing as any).session_type ?? 'coaching',
        coach_name: existing.coach_name ?? '',
        starts_at: existing.starts_at.slice(0, 16),
        duration_minutes: existing.duration_minutes ?? 60,
        status: existing.status,
        meeting_url: (existing as any).meeting_url ?? '',
        recording_url: existing.recording_url ?? '',
        recording_provider: existing.recording_provider ?? '',
        recording_status: existing.recording_status,
        is_private: existing.is_private,
      })
      setSelectedClients(
        (existing.session_participants ?? []).map(sp => ({
          id: sp.user_id,
          name: sp.profiles?.full_name ?? sp.user_id,
        }))
      )
    }
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const now = new Date().toISOString()
      const payload = {
        ...data,
        starts_at: new Date(data.starts_at).toISOString(),
        updated_at: now,
        updated_by: user?.id,
        ...(isEdit ? {} : { created_by: user?.id }),
      }

      let sessionId = id
      if (isEdit) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabase.from('client_sessions') as any).update(payload).eq('id', id)
        if (error) throw error
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: newSession, error } = await (supabase.from('client_sessions') as any).insert(payload).select('id').single()
        if (error) throw error
        sessionId = newSession.id
      }

      // Sync participants for this session
      if (selectedClients.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('session_participants') as any).delete().eq('session_id', sessionId)
        const participants = selectedClients.map(c => ({
          session_id: sessionId,
          user_id: c.id,
          attendance_status: 'attended',
        }))
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: pErr } = await (supabase.from('session_participants') as any).insert(participants)
        if (pErr) throw pErr
      }

      await logAdminAction(user!.id, isEdit ? 'update' : 'create', 'client_session', sessionId!, `${isEdit ? 'Updated' : 'Created'} session: ${data.title}`)
    },
    onSuccess: () => {
      toast(isEdit ? 'Session updated' : 'Session created', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'sessions'] })
      queryClient.invalidateQueries({ queryKey: ['sessions'] })
      navigate('/admin/sessions')
    },
    onError: (err: Error) => toast(err.message || 'Failed to save', 'error'),
  })

  const filteredClients = allClients.filter(c =>
    !selectedClients.find(s => s.id === c.id) &&
    (c.full_name?.toLowerCase().includes(clientSearch.toLowerCase()) ?? false)
  )

  const addClient = (client: Profile) => {
    setSelectedClients(prev => [...prev, { id: client.id, name: client.full_name ?? client.id }])
    setClientSearch('')
  }

  const removeClient = (clientId: string) => setSelectedClients(prev => prev.filter(c => c.id !== clientId))

  return (
    <AdminShell>
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/admin/sessions')} className="w-9 h-9 rounded-xl border border-[#E8DDF2] flex items-center justify-center text-[#8C7B85] hover:bg-[#FCF7F0] transition-colors">
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-xl font-bold text-[#321B26]">{isEdit ? 'Edit Session' : 'New Session'}</h1>
      </div>

      {isEdit && isLoading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-5">
              {/* Basic info */}
              <Card title="Session details">
                <AdminInput label="Title" required {...register('title')} error={errors.title?.message} />
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect label="Kind" {...register('session_kind')}>
                    <option value="1on1">1-on-1</option>
                    <option value="group">Group</option>
                  </AdminSelect>
                  <AdminSelect label="Type" {...register('session_type')}>
                    <option value="coaching">Coaching</option>
                    <option value="meditation">Meditation</option>
                    <option value="breathwork">Breathwork</option>
                    <option value="akashic">Akashic Records</option>
                    <option value="counselling">Counselling</option>
                    <option value="energy_healing">Energy healing</option>
                    <option value="other">Other</option>
                  </AdminSelect>
                </div>
                <AdminInput label="Coach / facilitator" {...register('coach_name')} />
                <div className="grid grid-cols-2 gap-4">
                  <AdminInput label="Date & time" type="datetime-local" required {...register('starts_at')} error={errors.starts_at?.message} />
                  <AdminInput label="Duration (minutes)" type="number" {...register('duration_minutes', { valueAsNumber: true })} />
                </div>
                <AdminInput label="Meeting URL" type="url" placeholder="https://zoom.us/…" {...register('meeting_url')} />
              </Card>

              {/* Recording */}
              <Card title="Recording">
                <div className="grid grid-cols-2 gap-4">
                  <AdminSelect label="Status" {...register('recording_status')}>
                    <option value="none">No recording</option>
                    <option value="processing">Processing</option>
                    <option value="available">Available</option>
                    <option value="expired">Expired</option>
                  </AdminSelect>
                  <AdminInput label="Provider" placeholder="vimeo / youtube / zoom" {...register('recording_provider')} />
                </div>
                <AdminInput label="Recording URL" type="url" placeholder="https://vimeo.com/…" {...register('recording_url')} />
              </Card>

              {/* Participants */}
              <Card title="Assigned clients">
                <div className="relative">
                  <UserPlus size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C4B5BD]" />
                  <input
                    value={clientSearch}
                    onChange={e => setClientSearch(e.target.value)}
                    placeholder="Search to add a client…"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#E8DDF2] text-sm bg-white text-[#321B26] placeholder-[#C4B5BD] focus:outline-none focus:ring-2 focus:ring-[#7C2447]/20"
                  />
                  {clientSearch && filteredClients.length > 0 && (
                    <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-[#E8DDF2] shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                      {filteredClients.slice(0, 10).map(c => (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => addClient(c)}
                          className="w-full text-left px-4 py-2.5 text-sm text-[#321B26] hover:bg-[#FCF7F0] transition-colors"
                        >
                          {c.full_name ?? c.id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedClients.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {selectedClients.map(c => (
                      <div key={c.id} className="bg-[#FCF7F0] rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-[#321B26]">{c.name}</p>
                          <button type="button" onClick={() => removeClient(c.id)} className="text-[#C4B5BD] hover:text-[#7C2447]"><X size={14} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>

            <div className="space-y-5">
              <Card title="Settings">
                <AdminSelect label="Status" {...register('status')}>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </AdminSelect>
                <Controller name="is_private" control={control} render={({ field }) => (
                  <AdminToggle label="Private" description="Only assigned clients can see this" checked={field.value} onChange={field.onChange} />
                )} />
              </Card>
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold hover:bg-[#6a1e3b] transition-colors disabled:opacity-50"
              >
                <Save size={15} />
                {saveMutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create session'}
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
