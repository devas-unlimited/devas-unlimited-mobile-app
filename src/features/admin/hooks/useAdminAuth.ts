import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import { supabase } from '@/lib/supabase'

export type AdminAuthState = 'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'

export function useAdminAuth() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [state, setState] = useState<AdminAuthState>('loading')

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      setState('unauthenticated')
      navigate('/login', { replace: true })
      return
    }

    // Check DB-backed role — never trust user_metadata
    supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'super_admin'])
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) {
          setState('authorized')
        } else {
          setState('unauthorized')
        }
      })
  }, [user, authLoading, navigate])

  return state
}
