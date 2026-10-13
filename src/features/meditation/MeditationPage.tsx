import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Pause, Square, BarChart2 } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { useMeditationTimer } from '@/hooks/useMeditationTimer'
import { useToast } from '@/components/feedback/Toast'
import { formatDuration } from '@/lib/utils'
import { getTodayIntention } from '@/lib/intentions'
import { useQueryClient } from '@tanstack/react-query'

const DURATIONS = [5, 10, 15, 20, 30, 45, 60]

export function MeditationPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedDuration, setSelectedDuration] = useState(10)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const todayIntention = getTodayIntention()

  const {
    status,
    remaining,
    progress,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    resetTimer,
  } = useMeditationTimer(user?.id)

  const handleStart = () => {
    startTimer(selectedDuration * 60, todayIntention)
  }

  const handleFinish = () => {
    if (status === 'completed') {
      toast('Your meditation has been saved. ✦', 'success')
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      queryClient.invalidateQueries({ queryKey: ['meditation-insights'] })
      queryClient.invalidateQueries({ queryKey: ['journey-progress'] })
      resetTimer()
    }
  }

  const handleCancelRequest = () => {
    if (status === 'active' || status === 'paused') {
      setShowCancelConfirm(true)
    }
  }

  const confirmCancel = () => {
    setShowCancelConfirm(false)
    cancelTimer()
  }

  const remainingSeconds = Math.ceil(remaining / 1000)

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#321B26]">Meditate</h1>
          <p className="text-[#8C7B85] text-sm mt-0.5">A quiet space to return to yourself.</p>
        </div>
        <Link
          to="/meditation-insights"
          aria-label="View meditation insights"
          className="flex items-center gap-1.5 text-xs font-semibold text-[#7C2447] bg-[#F9E2D8] px-3 py-2 rounded-full"
        >
          <BarChart2 size={14} />
          Insights
        </Link>
      </div>

      {/* Timer Circle */}
      <div className="flex flex-col items-center px-5 py-4">
        <div className="relative w-64 h-64">
          {/* Background circle */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
            <circle cx="100" cy="100" r="88" fill="none" stroke="#F7F0E9" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="88"
              fill="none"
              stroke="#7C2447"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress)}`}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Inner content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {status === 'idle' ? (
              <>
                <p className="text-4xl font-bold text-[#321B26]">{selectedDuration}</p>
                <p className="text-sm text-[#8C7B85] font-medium">minutes</p>
              </>
            ) : status === 'completed' ? (
              <>
                <p className="text-3xl font-bold text-[#7C2447]">Done</p>
                <p className="text-xs text-[#8C7B85] mt-1">Session complete</p>
              </>
            ) : (
              <>
                <p
                  className="text-4xl font-bold text-[#321B26] tabular-nums"
                  aria-live="polite"
                  aria-label={`${Math.floor(remainingSeconds / 60)} minutes ${remainingSeconds % 60} seconds remaining`}
                >
                  {formatDuration(remainingSeconds)}
                </p>
                <p className="text-xs text-[#8C7B85] mt-1 font-medium">
                  {status === 'paused' ? 'Paused' : 'Breathe in • Breathe out'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Breathe text when idle */}
        {status === 'idle' && (
          <p className="text-[#8C7B85] text-sm font-medium mt-2">Breathe in • Breathe out</p>
        )}
      </div>

      {/* Duration selector (only when idle) */}
      {status === 'idle' && (
        <div className="px-5 mb-5">
          <p className="text-xs font-semibold text-[#4A3540] uppercase tracking-wide mb-3">Choose duration</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {DURATIONS.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDuration(d)}
                aria-pressed={selectedDuration === d}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                  selectedDuration === d
                    ? 'bg-[#7C2447] text-white'
                    : 'bg-white text-[#8C7B85] border border-[#E8DDF2]'
                }`}
              >
                {d} min
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="px-5 mb-5 space-y-3">
        {status === 'idle' && (
          <button
            onClick={handleStart}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-base font-semibold shadow-lg active:scale-[0.98] transition-transform duration-150"
          >
            Start meditation
          </button>
        )}

        {(status === 'active' || status === 'paused') && (
          <div className="flex gap-3">
            <button
              onClick={status === 'active' ? pauseTimer : resumeTimer}
              className="flex-1 py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform duration-150"
            >
              {status === 'active' ? <><Pause size={18} /> Pause</> : <><Play size={18} /> Resume</>}
            </button>
            <button
              onClick={handleCancelRequest}
              aria-label="Cancel meditation"
              className="w-14 h-14 bg-white border border-[#E8DDF2] text-[#8C7B85] rounded-full flex items-center justify-center active:bg-[#F7F0E9] transition-colors"
            >
              <Square size={18} />
            </button>
          </div>
        )}

        {status === 'completed' && (
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-[#DDE9D3] text-[#2D6B4A] rounded-full text-base font-semibold active:scale-[0.98] transition-transform duration-150"
          >
            ✓ Save session
          </button>
        )}
      </div>

      {/* Today's Intention */}
      <div className="px-5 mb-4">
        <div className="bg-white rounded-[20px] p-4 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
          <p className="text-[10px] font-bold tracking-widest text-[#7C2447] uppercase mb-1">Today's intention</p>
          <p className="text-[#321B26] font-medium text-sm leading-relaxed">{todayIntention}</p>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-end"
          onClick={() => setShowCancelConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Cancel meditation confirmation"
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-[32px] p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#E8DDF2] mx-auto mb-6" />
            <h2 className="text-lg font-bold text-[#321B26] mb-2">End this session?</h2>
            <p className="text-[#8C7B85] text-sm mb-6">Your progress won't be saved if you cancel now.</p>
            <div className="space-y-3">
              <button
                onClick={confirmCancel}
                className="w-full py-3.5 bg-[#7C2447] text-white rounded-full text-sm font-semibold"
              >
                End session
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="w-full py-3.5 border border-[#E8DDF2] text-[#4A3540] rounded-full text-sm font-semibold"
              >
                Continue meditating
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
