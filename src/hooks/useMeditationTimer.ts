import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'

type TimerStatus = 'idle' | 'active' | 'paused' | 'completed' | 'cancelled'

interface TimerState {
  status: TimerStatus
  durationSeconds: number
  startedAt: number | null
  pausedAt: number | null
  pausedElapsed: number
  intention: string
}

const STORAGE_KEY = 'devas_timer'

function loadState(): TimerState | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as TimerState) : null
  } catch {
    return null
  }
}

function saveState(state: TimerState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function clearState() {
  sessionStorage.removeItem(STORAGE_KEY)
}

function getElapsed(state: TimerState): number {
  if (state.status === 'paused' && state.pausedAt !== null) {
    return state.pausedElapsed + (state.pausedAt - (state.startedAt ?? state.pausedAt))
  }
  if (state.status === 'active' && state.startedAt !== null) {
    return state.pausedElapsed + (Date.now() - state.startedAt)
  }
  return state.pausedElapsed
}

export function useMeditationTimer(userId: string | undefined) {
  const [timerState, setTimerState] = useState<TimerState>(() => {
    const saved = loadState()
    if (saved && (saved.status === 'active' || saved.status === 'paused')) return saved
    return { status: 'idle', durationSeconds: 10 * 60, startedAt: null, pausedAt: null, pausedElapsed: 0, intention: '' }
  })
  const [elapsed, setElapsed] = useState(0)
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedRef = useRef(false)

  const updateElapsed = useCallback(() => {
    setElapsed(getElapsed(timerState))
  }, [timerState])

  useEffect(() => {
    updateElapsed()
    if (timerState.status === 'active') {
      tickRef.current = setInterval(updateElapsed, 500)
    }
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [timerState, updateElapsed])

  // Auto-complete when elapsed >= duration
  useEffect(() => {
    if (timerState.status === 'active' && elapsed >= timerState.durationSeconds * 1000) {
      if (!completedRef.current) {
        completedRef.current = true
        handleComplete()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsed, timerState.status, timerState.durationSeconds])

  const startTimer = useCallback((durationSeconds: number, intention: string) => {
    completedRef.current = false
    const state: TimerState = {
      status: 'active',
      durationSeconds,
      startedAt: Date.now(),
      pausedAt: null,
      pausedElapsed: 0,
      intention,
    }
    setTimerState(state)
    saveState(state)
  }, [])

  const pauseTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'active') return prev
      const now = Date.now()
      const newElapsed = prev.pausedElapsed + (now - (prev.startedAt ?? now))
      const next: TimerState = { ...prev, status: 'paused', pausedAt: now, pausedElapsed: newElapsed, startedAt: null }
      saveState(next)
      return next
    })
  }, [])

  const resumeTimer = useCallback(() => {
    setTimerState(prev => {
      if (prev.status !== 'paused') return prev
      const next: TimerState = { ...prev, status: 'active', startedAt: Date.now(), pausedAt: null }
      saveState(next)
      return next
    })
  }, [])

  const handleComplete = useCallback(async () => {
    setTimerState(prev => {
      const next = { ...prev, status: 'completed' as TimerStatus }
      clearState()
      return next
    })

    if (!userId) return
    const durationSeconds = timerState.durationSeconds
    const startedAt = new Date(Date.now() - durationSeconds * 1000).toISOString()
    const completedAt = new Date().toISOString()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('meditation_sessions') as any).insert({
      user_id: userId,
      started_at: startedAt,
      completed_at: completedAt,
      duration_seconds: durationSeconds,
      intention: timerState.intention || null,
      status: 'completed',
    })
  }, [userId, timerState])

  const cancelTimer = useCallback(() => {
    completedRef.current = false
    clearState()
    setTimerState({ status: 'idle', durationSeconds: 10 * 60, startedAt: null, pausedAt: null, pausedElapsed: 0, intention: '' })
    setElapsed(0)
  }, [])

  const resetTimer = useCallback(() => {
    completedRef.current = false
    clearState()
    setTimerState(prev => ({ ...prev, status: 'idle', startedAt: null, pausedAt: null, pausedElapsed: 0 }))
    setElapsed(0)
  }, [])

  const remaining = Math.max(0, timerState.durationSeconds * 1000 - elapsed)
  const progress = timerState.durationSeconds > 0 ? Math.min(1, elapsed / (timerState.durationSeconds * 1000)) : 0

  return {
    status: timerState.status,
    elapsed,
    remaining,
    progress,
    durationSeconds: timerState.durationSeconds,
    intention: timerState.intention,
    startTimer,
    pauseTimer,
    resumeTimer,
    cancelTimer,
    resetTimer,
  }
}
