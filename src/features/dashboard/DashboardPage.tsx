import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronRight, Timer, BookOpen, TrendingUp, Flame, Clock, Star, X, ExternalLink, Megaphone, ChevronDown } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { fetchDashboardStats, fetchFeaturedEvent, fetchNextEvent, fetchActiveAnnouncements, dismissAnnouncement } from '@/services/dashboard'
import { getFirstName } from '@/lib/utils'
import { ProfileMenu } from '@/features/dashboard/ProfileMenu'

export function DashboardPage() {
  const { user, profile } = useAuth()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: () => fetchDashboardStats(user!.id),
    enabled: Boolean(user?.id),
  })

  const { data: featuredEvent, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured-event'],
    queryFn: fetchFeaturedEvent,
    staleTime: 1000 * 60 * 5,
  })

  const { data: nextEvent, isLoading: nextLoading } = useQuery({
    queryKey: ['next-event'],
    queryFn: fetchNextEvent,
    staleTime: 1000 * 60 * 5,
  })

  const queryClient = useQueryClient()
  const firstName = getFirstName(profile?.full_name ?? user?.user_metadata?.full_name)

  const { data: announcements = [], isLoading: announcementsLoading } = useQuery({
    queryKey: ['announcements', user?.id],
    queryFn: () => fetchActiveAnnouncements(user!.id),
    enabled: Boolean(user?.id),
    staleTime: 1000 * 60 * 2,
  })

  const dismissMutation = useMutation({
    mutationFn: (announcementId: string) => dismissAnnouncement(user!.id, announcementId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['announcements', user?.id] }),
  })

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-[#321B26]">Hi, {firstName}</h1>
            <p className="text-[#8C7B85] text-sm mt-0.5">Here's what's unfolding for you.</p>
          </div>
          <ProfileMenu />
        </div>
      </div>

      {/* Featured Event Card */}
      <div className="px-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold tracking-widest text-[#7C2447] uppercase">Featured</span>
          <Link to="/events" className="text-xs text-[#7C2447] font-semibold flex items-center gap-0.5">
            View all <ChevronRight size={14} />
          </Link>
        </div>

        {featuredLoading ? (
          <Skeleton className="h-44 w-full" />
        ) : featuredEvent ? (
          <div
            className="relative rounded-[24px] overflow-hidden p-5 min-h-[160px] flex flex-col justify-end"
            style={{ background: 'linear-gradient(145deg, #7C2447 0%, #321B26 100%)' }}
          >
            <OrgBlobs />
            <div className="relative z-10">
              <p className="text-xs text-white/60 font-medium mb-1">
                {featuredEvent.format} • {featuredEvent.city ?? ''}
              </p>
              <h2 className="text-xl font-bold text-white mb-0.5">{featuredEvent.title}</h2>
              <p className="text-sm text-white/70 mb-3">
                {featuredEvent.description?.split('\n')[0] ?? ''}
              </p>
              {featuredEvent.registration_url ? (
                <a
                  href={featuredEvent.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-full backdrop-blur-sm"
                >
                  Explore event
                </a>
              ) : (
                <Link
                  to={`/events`}
                  className="inline-block px-5 py-2 bg-white/20 border border-white/30 text-white text-xs font-semibold rounded-full backdrop-blur-sm"
                >
                  Explore event
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] bg-[#F7F0E9] p-5 text-center">
            <p className="text-[#8C7B85] text-sm">No upcoming featured events yet.</p>
          </div>
        )}
      </div>

      {/* Your Rhythm Stats */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-bold text-[#321B26] mb-3">Your rhythm</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            loading={statsLoading}
            value={stats?.minutesToday ?? 0}
            label="min today"
            icon={<Clock size={16} className="text-[#7C2447]" />}
            bg="#F9E2D8"
          />
          <StatCard
            loading={statsLoading}
            value={stats?.dayStreak ?? 0}
            label="day streak"
            icon={<Flame size={16} className="text-[#E6B74B]" />}
            bg="#FFF3D6"
          />
          <StatCard
            loading={statsLoading}
            value={stats?.totalMinutes ?? 0}
            label="total min"
            icon={<Star size={16} className="text-[#7C2447]" />}
            bg="#E8DDF2"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-bold text-[#321B26] mb-3">Quick actions</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction to="/meditate" icon={<Timer size={22} className="text-[#7C2447]" />} label="Meditate" sub="Begin a session" bg="#F9E2D8" />
          <QuickAction to="/sessions" icon={<BookOpen size={22} className="text-[#7C2447]" />} label="My Sessions" sub="History & recordings" bg="#DDE9D3" />
          <QuickAction to="/journey" icon={<TrendingUp size={22} className="text-[#7C2447]" />} label="My Journey" sub="See your next level" bg="#E8DDF2" />
        </div>
      </div>

      {/* Announcements */}
      {(announcementsLoading || announcements.length > 0) && (
        <div className="px-5 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Megaphone size={14} className="text-[#7C2447]" />
            <h2 className="text-sm font-bold text-[#321B26]">From Devas</h2>
          </div>
          {announcementsLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-3">
              {announcements.map((a: any) => (
                <AnnouncementCard
                  key={a.id}
                  announcement={a}
                  onDismiss={() => dismissMutation.mutate(a.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coming Up */}
      {(nextLoading || nextEvent) && (
        <div className="px-5 mb-6">
          <h2 className="text-sm font-bold text-[#321B26] mb-3">Coming up</h2>
          {nextLoading ? (
            <Skeleton className="h-20 w-full" />
          ) : nextEvent ? (
            <Link to="/events" className="block">
              <div className="bg-white rounded-[20px] p-4 flex items-center gap-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
                <div className="w-10 h-10 rounded-xl bg-[#DDEDF1] flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🌕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#321B26] text-sm truncate">{nextEvent.title}</p>
                  <p className="text-xs text-[#8C7B85] mt-0.5">
                    {format(new Date(nextEvent.starts_at), 'd MMM • h:mm aa')} • {nextEvent.format}
                  </p>
                </div>
                <ChevronRight size={18} className="text-[#8C7B85] flex-shrink-0" />
              </div>
            </Link>
          ) : null}
        </div>
      )}
    </AppShell>
  )
}

function StatCard({ loading, value, label, icon, bg }: {
  loading: boolean
  value: number
  label: string
  icon: React.ReactNode
  bg: string
}) {
  return (
    <div className="bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(50,27,38,0.06)]">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
        {icon}
      </div>
      {loading ? (
        <Skeleton className="h-6 w-10 mb-1" />
      ) : (
        <p className="text-xl font-bold text-[#321B26]">{value}</p>
      )}
      <p className="text-[10px] text-[#8C7B85] font-medium">{label}</p>
    </div>
  )
}

const PRIORITY_COLORS: Record<string, string> = {
  urgent: '#FDECEA',
  important: '#FFF3D6',
  normal: '#F0F7FF',
}

const PRIORITY_TEXT: Record<string, string> = {
  urgent: '#C0392B',
  important: '#8B6914',
  normal: '#1A6B7C',
}

function AnnouncementCard({ announcement: a, onDismiss }: { announcement: any; onDismiss: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const bg = PRIORITY_COLORS[a.priority] ?? PRIORITY_COLORS.normal
  const textColor = PRIORITY_TEXT[a.priority] ?? PRIORITY_TEXT.normal
  const hasMore = Boolean(a.full_content && a.full_content.trim())

  return (
    <div className="rounded-[20px] p-4 shadow-[0_2px_12px_rgba(50,27,38,0.06)]" style={{ background: bg }}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            {a.priority !== 'normal' && (
              <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: textColor }}>{a.priority}</span>
            )}
            <p className="text-sm font-semibold text-[#321B26] leading-snug">{a.title}</p>
          </div>
          <p className="text-xs text-[#4A3540] leading-relaxed">{a.short_message}</p>
          {expanded && hasMore && (
            <p className="text-xs text-[#4A3540] mt-2 leading-relaxed border-t border-black/10 pt-2">{a.full_content}</p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {hasMore && (
              <button onClick={() => setExpanded(e => !e)} className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: textColor }}>
                {expanded ? 'Show less' : 'Read more'}
                <ChevronDown size={11} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
              </button>
            )}
            {a.cta_label && a.cta_url && (
              <a href={a.cta_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-semibold" style={{ color: textColor }}>
                {a.cta_label} <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
        {a.is_dismissible && (
          <button onClick={onDismiss} className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-black/10 text-[#8C7B85] hover:bg-black/20 transition-colors" aria-label="Dismiss">
            <X size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

function QuickAction({ to, icon, label, sub, bg }: {
  to: string
  icon: React.ReactNode
  label: string
  sub: string
  bg: string
}) {
  return (
    <Link to={to} className="block">
      <div className="bg-white rounded-[20px] p-3 shadow-[0_2px_12px_rgba(50,27,38,0.06)] active:scale-[0.97] transition-transform duration-150">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: bg }}>
          {icon}
        </div>
        <p className="text-xs font-semibold text-[#321B26] leading-tight">{label}</p>
        <p className="text-[10px] text-[#8C7B85] mt-0.5 leading-tight">{sub}</p>
      </div>
    </Link>
  )
}
