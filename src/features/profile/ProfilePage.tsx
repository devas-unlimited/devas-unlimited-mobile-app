import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, LogOut } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { AppShell } from '@/components/layout/AppShell'
import { useToast } from '@/components/feedback/Toast'
import { supabase } from '@/lib/supabase'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
})

type FormData = z.infer<typeof schema>

export function ProfilePage() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: profile?.full_name ?? user?.user_metadata?.full_name ?? '' },
  })

  const onSubmit = async (data: FormData) => {
    setIsSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('profiles') as any)
        .update({ full_name: data.full_name, updated_at: new Date().toISOString() })
        .eq('id', user!.id)

      if (error) throw error
      toast('Profile updated', 'success')
    } catch {
      toast('Could not save changes. Try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSignOut = async () => {
    setShowSignOutConfirm(false)
    await signOut()
    navigate('/login', { replace: true })
  }

  const displayName = profile?.full_name ?? user?.user_metadata?.full_name ?? 'Friend'
  const email = user?.email ?? ''
  const initials = displayName[0]?.toUpperCase() ?? 'D'

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
        <h1 className="text-lg font-bold text-[#321B26]">Account Settings</h1>
      </div>

      <div className="px-5 pb-6 space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full bg-[#7C2447] text-white flex items-center justify-center text-2xl font-bold mb-3">
            {initials}
          </div>
          <p className="font-semibold text-[#321B26]">{displayName}</p>
          <p className="text-xs text-[#8C7B85]">{email}</p>
        </div>

        {/* Edit form */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
          <h2 className="text-sm font-bold text-[#321B26] mb-4">Profile details</h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
                Full name
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                className={`w-full px-4 py-3.5 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] bg-[#FCF7F0] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all ${errors.full_name ? 'border-red-400' : 'border-[#E8DDF2]'}`}
                {...register('full_name')}
              />
              {errors.full_name && <p role="alert" className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
                Email address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-3.5 rounded-2xl border border-[#E8DDF2] text-[#8C7B85] text-sm bg-[#F7F0E9] cursor-not-allowed"
                aria-describedby="email-help"
              />
              <p id="email-help" className="mt-1 text-xs text-[#C4B5BD]">Email cannot be changed here</p>
            </div>

            <button
              type="submit"
              disabled={isSaving || !isDirty}
              className="w-full py-3.5 bg-[#7C2447] text-white rounded-full text-sm font-semibold active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_16px_rgba(50,27,38,0.07)]">
          <h2 className="text-sm font-bold text-[#321B26] mb-4">Account actions</h2>
          <button
            onClick={() => setShowSignOutConfirm(true)}
            className="w-full flex items-center gap-3 py-3.5 px-4 border border-[#E8DDF2] text-[#7C2447] rounded-2xl text-sm font-semibold active:bg-[#FCF7F0] transition-colors"
          >
            <LogOut size={16} />
            Sign out of all devices
          </button>
        </div>
      </div>

      {/* Sign-out confirmation */}
      {showSignOutConfirm && (
        <div
          className="fixed inset-0 bg-[#321B26]/50 z-50 flex items-end"
          onClick={() => setShowSignOutConfirm(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-lg mx-auto bg-white rounded-t-[32px] p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-[#E8DDF2] mx-auto mb-5" />
            <h2 className="text-lg font-bold text-[#321B26] mb-2">Sign out?</h2>
            <p className="text-[#8C7B85] text-sm mb-6">You'll be returned to the login screen.</p>
            <div className="space-y-3">
              <button onClick={handleSignOut} className="w-full py-3.5 bg-[#7C2447] text-white rounded-full text-sm font-semibold">
                Sign out
              </button>
              <button onClick={() => setShowSignOutConfirm(false)} className="w-full py-3.5 border border-[#E8DDF2] text-[#4A3540] rounded-full text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
