import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/features/auth/AuthContext'
import { ToastProvider } from '@/components/feedback/Toast'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { AdminRoute } from '@/components/layout/AdminRoute'
import { queryClient } from '@/lib/queryClient'

// Auth — eager (no auth = show these immediately)
import { SplashPage } from '@/features/auth/SplashPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { SignUpPage } from '@/features/auth/SignUpPage'
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage'
import { AuthCallback } from '@/features/auth/AuthCallback'

// App screens — lazy for code splitting
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })))
const EventsPage = lazy(() => import('@/features/events/EventsPage').then(m => ({ default: m.EventsPage })))
const SessionsPage = lazy(() => import('@/features/sessions/SessionsPage').then(m => ({ default: m.SessionsPage })))
const SessionDetailPage = lazy(() => import('@/features/sessions/SessionDetailPage').then(m => ({ default: m.SessionDetailPage })))
const MeditationPage = lazy(() => import('@/features/meditation/MeditationPage').then(m => ({ default: m.MeditationPage })))
const MeditationInsightsPage = lazy(() => import('@/features/meditation/MeditationInsightsPage').then(m => ({ default: m.MeditationInsightsPage })))
const JourneyPage = lazy(() => import('@/features/journey/JourneyPage').then(m => ({ default: m.JourneyPage })))
const SanctuaryPage = lazy(() => import('@/features/sanctuary/SanctuaryPage').then(m => ({ default: m.SanctuaryPage })))
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage').then(m => ({ default: m.ProfilePage })))

// Admin screens — separate lazy chunk
const AdminOverviewPage = lazy(() => import('@/features/admin/pages/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })))
const AdminEventsPage = lazy(() => import('@/features/admin/pages/AdminEventsPage').then(m => ({ default: m.AdminEventsPage })))
const AdminEventFormPage = lazy(() => import('@/features/admin/pages/AdminEventFormPage').then(m => ({ default: m.AdminEventFormPage })))
const AdminAnnouncementsPage = lazy(() => import('@/features/admin/pages/AdminAnnouncementsPage').then(m => ({ default: m.AdminAnnouncementsPage })))
const AdminAnnouncementFormPage = lazy(() => import('@/features/admin/pages/AdminAnnouncementFormPage').then(m => ({ default: m.AdminAnnouncementFormPage })))
const AdminSessionsPage = lazy(() => import('@/features/admin/pages/AdminSessionsPage').then(m => ({ default: m.AdminSessionsPage })))
const AdminSessionFormPage = lazy(() => import('@/features/admin/pages/AdminSessionFormPage').then(m => ({ default: m.AdminSessionFormPage })))
const AdminResourcesPage = lazy(() => import('@/features/admin/pages/AdminResourcesPage').then(m => ({ default: m.AdminResourcesPage })))
const AdminResourceFormPage = lazy(() => import('@/features/admin/pages/AdminResourceFormPage').then(m => ({ default: m.AdminResourceFormPage })))
const AdminClientsPage = lazy(() => import('@/features/admin/pages/AdminClientsPage').then(m => ({ default: m.AdminClientsPage })))
const AdminClientDetailPage = lazy(() => import('@/features/admin/pages/AdminClientDetailPage').then(m => ({ default: m.AdminClientDetailPage })))
const AdminSettingsPage = lazy(() => import('@/features/admin/pages/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FCF7F0]">
      <div className="w-10 h-10 rounded-full border-2 border-[#7C2447] border-t-transparent animate-spin" />
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Suspense fallback={<PageFallback />}>
                <Routes>
                  {/* Public */}
                  <Route path="/" element={<SplashPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />

                  {/* Protected */}
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><EventsPage /></ProtectedRoute>} />
                  <Route path="/sessions" element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
                  <Route path="/sessions/:id" element={<ProtectedRoute><SessionDetailPage /></ProtectedRoute>} />
                  <Route path="/meditate" element={<ProtectedRoute><MeditationPage /></ProtectedRoute>} />
                  <Route path="/meditation-insights" element={<ProtectedRoute><MeditationInsightsPage /></ProtectedRoute>} />
                  <Route path="/journey" element={<ProtectedRoute><JourneyPage /></ProtectedRoute>} />
                  <Route path="/sanctuary" element={<ProtectedRoute><SanctuaryPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                  {/* Admin — DB-role-gated, completely separate chunk */}
                  <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
                  <Route path="/admin/overview" element={<AdminRoute><AdminOverviewPage /></AdminRoute>} />
                  <Route path="/admin/events" element={<AdminRoute><AdminEventsPage /></AdminRoute>} />
                  <Route path="/admin/events/new" element={<AdminRoute><AdminEventFormPage /></AdminRoute>} />
                  <Route path="/admin/events/:id" element={<AdminRoute><AdminEventFormPage /></AdminRoute>} />
                  <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncementsPage /></AdminRoute>} />
                  <Route path="/admin/announcements/new" element={<AdminRoute><AdminAnnouncementFormPage /></AdminRoute>} />
                  <Route path="/admin/announcements/:id" element={<AdminRoute><AdminAnnouncementFormPage /></AdminRoute>} />
                  <Route path="/admin/sessions" element={<AdminRoute><AdminSessionsPage /></AdminRoute>} />
                  <Route path="/admin/sessions/new" element={<AdminRoute><AdminSessionFormPage /></AdminRoute>} />
                  <Route path="/admin/sessions/:id" element={<AdminRoute><AdminSessionFormPage /></AdminRoute>} />
                  <Route path="/admin/resources" element={<AdminRoute><AdminResourcesPage /></AdminRoute>} />
                  <Route path="/admin/resources/new" element={<AdminRoute><AdminResourceFormPage /></AdminRoute>} />
                  <Route path="/admin/resources/:id" element={<AdminRoute><AdminResourceFormPage /></AdminRoute>} />
                  <Route path="/admin/clients" element={<AdminRoute><AdminClientsPage /></AdminRoute>} />
                  <Route path="/admin/clients/:id" element={<AdminRoute><AdminClientDetailPage /></AdminRoute>} />
                  <Route path="/admin/settings" element={<AdminRoute><AdminSettingsPage /></AdminRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
