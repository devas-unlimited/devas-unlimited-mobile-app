import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { ArrowLeft, ExternalLink, Video, Clock, User } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { fetchSessionById } from '@/services/sessions'
import { formatDuration } from '@/lib/utils'

export function SessionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: session, isLoading, error } = useQuery({
    queryKey: ['session', id, user?.id],
    queryFn: () => fetchSessionById(id!, user!.id),
    enabled: Boolean(id && user?.id),
  })

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-8 pb-4">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-[0_2px_8px_rgba(50,27,38,0.08)]"
        >
          <ArrowLeft size={20} className="text-[#321B26]" />
        </button>
        <h1 className="text-lg font-bold text-[#321B26]">Session Details</h1>
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : error || !session ? (
        <div className="px-5 py-16 text-center">
          <p className="text-[#8C7B85] text-sm mb-4">We couldn't load this session.</p>
          <button onClick={() => navigate('/sessions')} className="px-5 py-2 bg-[#7C2447] text-white rounded-full text-sm font-medium">
            Back to sessions
          </button>
        </div>
      ) : (
        <div className="px-5 pb-6 space-y-4">
          {/* Main Session Card */}
          <div
            className="rounded-[24px] p-5"
            style={{ background: 'linear-gradient(145deg, #F9E2D8 0%, #F0D4C8 100%)' }}
          >
            {/* Badge */}
            <span className="inline-block text-[9px] font-bold tracking-widest text-[#7C2447] bg-white/60 px-2.5 py-1 rounded-full uppercase mb-3">
              {session.session_kind === '1on1' ? '1:1 Session' : 'Group Session'}
            </span>

            <h2 className="text-xl font-bold text-[#321B26] mb-1">{session.title}</h2>

            {session.coach_name && (
              <div className="flex items-center gap-1.5 text-sm text-[#7C2447] mb-3">
                <User size={14} />
                <span className="font-medium">with {session.coach_name}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm text-[#4A3540]">
              <Clock size={14} className="text-[#7C2447]" />
              <span>{format(new Date(session.starts_at), 'd MMM yyyy • h:mm aa')}</span>
            </div>
          </div>

          {/* Recording Section */}
          <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
            <div className="flex items-center gap-2 mb-3">
              <Video size={18} className="text-[#7C2447]" />
              <h3 className="font-semibold text-[#321B26] text-sm">Recording</h3>
            </div>

            {session.recording_status === 'available' && session.recording_url ? (
              <div className="space-y-3">
                <div className="bg-[#F7F0E9] rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#321B26]">Session recording</p>
                    {session.recording_duration_seconds && (
                      <p className="text-xs text-[#8C7B85] mt-0.5">
                        {formatDuration(session.recording_duration_seconds)} • Private access
                      </p>
                    )}
                  </div>
                </div>
                <a
                  href={session.recording_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-[#7C2447] text-white rounded-xl text-sm font-semibold"
                >
                  <ExternalLink size={16} />
                  Watch recording
                </a>
              </div>
            ) : session.recording_status === 'processing' ? (
              <RecordingState icon="⏳" message="Your recording is being processed. Check back soon." />
            ) : session.recording_status === 'expired' ? (
              <RecordingState icon="🔒" message="Access to this recording has expired." />
            ) : (
              <RecordingState icon="📹" message="No recording available for this session." />
            )}
          </div>

        </div>
      )}
    </AppShell>
  )
}

function RecordingState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="bg-[#F7F0E9] rounded-xl p-4 text-center">
      <span className="text-2xl block mb-2">{icon}</span>
      <p className="text-sm text-[#8C7B85]">{message}</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="px-5 space-y-4">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
