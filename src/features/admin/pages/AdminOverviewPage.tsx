import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Calendar, Users, Megaphone, BookOpen, Video, Plus, Clock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { AdminShell } from '../layout/AdminShell'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import { format } from 'date-fns'
import { fetchRecentActivity } from '../services/adminLog'
import { isAllDay } from '@/services/events'

async function fetchOverviewStats() {
  const [eventsRes, clientsRes, announcementsRes, resourcesRes, sessionsRes] = await Promise.all([
    (supabase.from('events') as any).select('id', { count: 'exact', head: true }).gte('starts_at', new Date().toISOString()),
    (supabase.from('profiles') as any).select('id', { count: 'exact', head: true }).eq('role', 'client'),
    (supabase.from('announcements') as any).select('id', { count: 'exact', head: true }).eq('status', 'published'),
    (supabase.from('resources') as any).select('id', { count: 'exact', head: true }).eq('is_published', true),
    (supabase.from('client_sessions') as any).select('id', { count: 'exact', head: true }).gte('starts_at', new Date().toISOString()),
  ])

  return {
    upcomingEvents: eventsRes.count ?? 0,
    totalClients: clientsRes.count ?? 0,
    publishedAnnouncements: announcementsRes.count ?? 0,
    sanctuaryResources: resourcesRes.count ?? 0,
    upcomingSessions: sessionsRes.count ?? 0,
  }
}

async function fetchUpcomingEvents() {
  const { data } = await (supabase.from('events') as any)
    .select('id, title, category, starts_at, ends_at, all_day, status, is_published, is_featured')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })
    .limit(5)
  return (data ?? []) as { id: string; title: string; category: string; starts_at: string; ends_at: string | null; all_day: boolean; status: string; is_published: boolean; is_featured: boolean }[]
}

async function fetchDraftContent() {
  const [eventDrafts, annDrafts, resDrafts] = await Promise.all([
    (supabase.from('events') as any).select('id, title, updated_at').eq('status', 'draft').limit(3),
    (supabase.from('announcements') as any).select('id, title, updated_at').eq('status', 'draft').limit(3),
    (supabase.from('resources') as any).select('id, title, updated_at').eq('is_published', false).limit(3),
  ])

  type DraftItem = { id: string; title: string; updated_at: string; type: string }
  const items: DraftItem[] = [
    ...((eventDrafts.data ?? []) as any[]).map((r: any) => ({ ...r, type: 'Event' })),
    ...((annDrafts.data ?? []) as any[]).map((r: any) => ({ ...r, type: 'Announcement' })),
    ...((resDrafts.data ?? []) as any[]).map((r: any) => ({ ...r, type: 'Resource' })),
  ]
  return items.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 6)
}

const QUICK_ACTIONS = [
  { label: 'Add announcement', to: '/admin/announcements/new', color: '#7C2447', icon: <Megaphone size={18} /> },
  { label: 'Create event', to: '/admin/events/new', color: '#1A6B7C', icon: <Calendar size={18} /> },
  { label: 'Schedule session', to: '/admin/sessions/new', color: '#2D6B4A', icon: <Video size={18} /> },
  { label: 'Add resource', to: '/admin/resources/new', color: '#5B3A7C', icon: <BookOpen size={18} /> },
]

export function AdminOverviewPage() {
  const navigate = useNavigate()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'overview', 'stats'],
    queryFn: fetchOverviewStats,
    staleTime: 0,
  })

  const { data: upcoming = [] } = useQuery({
    queryKey: ['admin', 'overview', 'upcoming'],
    queryFn: fetchUpcomingEvents,
    staleTime: 0,
  })

  const { data: drafts = [] } = useQuery({
    queryKey: ['admin', 'overview', 'drafts'],
    queryFn: fetchDraftContent,
    staleTime: 0,
  })

  const { data: activity = [] } = useQuery({
    queryKey: ['admin', 'overview', 'activity'],
    queryFn: () => fetchRecentActivity(10),
    staleTime: 0,
  })

  return (
    <AdminShell>
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#321B26]">Overview</h1>
        <p className="text-sm text-[#8C7B85] mt-0.5">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard label="Upcoming events" value={stats?.upcomingEvents ?? 0} icon={<Calendar size={18} />} loading={statsLoading} />
        <StatCard label="Active clients" value={stats?.totalClients ?? 0} icon={<Users size={18} />} accent="#1A6B7C" loading={statsLoading} />
        <StatCard label="Announcements live" value={stats?.publishedAnnouncements ?? 0} icon={<Megaphone size={18} />} accent="#E6B74B" loading={statsLoading} />
        <StatCard label="Sanctuary resources" value={stats?.sanctuaryResources ?? 0} icon={<BookOpen size={18} />} accent="#5B3A7C" loading={statsLoading} />
        <StatCard label="Upcoming sessions" value={stats?.upcomingSessions ?? 0} icon={<Video size={18} />} accent="#2D6B4A" loading={statsLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
            <h2 className="text-sm font-bold text-[#321B26] mb-4">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map(a => (
                <button
                  key={a.to}
                  onClick={() => navigate(a.to)}
                  className="flex items-center gap-3 p-3.5 rounded-xl border border-[#F0E6EC] hover:bg-[#FCF7F0] transition-colors text-left active:scale-[0.98]"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}18`, color: a.color }}>
                    {a.icon}
                  </div>
                  <span className="text-sm font-medium text-[#321B26]">{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-[#321B26]">Upcoming events</h2>
              <button onClick={() => navigate('/admin/events')} className="text-xs text-[#7C2447] font-medium hover:underline">View all</button>
            </div>
            {upcoming.length === 0 ? (
              <EmptyState label="No upcoming events" />
            ) : (
              <div className="space-y-2">
                {upcoming.map(ev => (
                  <button
                    key={ev.id}
                    onClick={() => navigate(`/admin/events/${ev.id}`)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FCF7F0] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E8DDF2] flex items-center justify-center flex-shrink-0">
                      <Calendar size={16} className="text-[#7C2447]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#321B26] truncate">{ev.title}</p>
                      <p className="text-xs text-[#8C7B85]">{isAllDay(ev) ? format(new Date(ev.starts_at), 'dd MMM yyyy') : format(new Date(ev.starts_at), 'dd MMM yyyy • HH:mm')}</p>
                    </div>
                    <StatusBadge status={ev.status} size="sm" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Drafts */}
          {drafts.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC]">
              <h2 className="text-sm font-bold text-[#321B26] mb-4">Drafts needing attention</h2>
              <div className="space-y-2">
                {drafts.map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#FCF7F0]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#321B26] truncate">{d.title}</p>
                      <p className="text-xs text-[#8C7B85]">{d.type} • updated {format(new Date(d.updated_at), 'dd MMM')}</p>
                    </div>
                    <StatusBadge status="draft" size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column — activity log */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(50,27,38,0.06)] border border-[#F0E6EC] h-fit">
          <h2 className="text-sm font-bold text-[#321B26] mb-4">Recent activity</h2>
          {activity.length === 0 ? (
            <EmptyState label="No activity yet" />
          ) : (
            <div className="space-y-3">
              {activity.map(a => (
                <div key={a.id} className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E8DDF2] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock size={11} className="text-[#7C2447]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-[#321B26] font-medium">{a.summary}</p>
                    <p className="text-[10px] text-[#C4B5BD] mt-0.5">{format(new Date(a.created_at), 'dd MMM HH:mm')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-8 flex flex-col items-center text-center">
      <div className="w-10 h-10 rounded-full bg-[#F7F0E9] flex items-center justify-center mb-2">
        <Plus size={18} className="text-[#C4B5BD]" />
      </div>
      <p className="text-sm text-[#8C7B85]">{label}</p>
    </div>
  )
}
