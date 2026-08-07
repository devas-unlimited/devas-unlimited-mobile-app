import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { DevasSymbol } from '@/components/ui/DevasSymbol'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormData = z.infer<typeof schema>

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      })
      if (error) {
        setError('root', { message: error.message })
      } else {
        setSent(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] px-8 text-center">
        <OrgBlobs variant="auth" />
        <div className="relative z-10 max-w-xs">
          <div className="w-16 h-16 rounded-full bg-[#DDEDF1] flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✉</span>
          </div>
          <h2 className="text-2xl font-bold text-[#321B26] mb-3">Reset link sent</h2>
          <p className="text-[#8C7B85] text-sm leading-relaxed mb-8">
            Check your email for a password reset link. It may take a few minutes to arrive.
          </p>
          <Link
            to="/login"
            className="block w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold text-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FCF7F0] overflow-hidden">
      <OrgBlobs variant="auth" />
      <div className="relative z-10 flex items-center justify-between pt-14 pb-8 px-6">
        <Link to="/login" aria-label="Back to login" className="text-[#7C2447]">
          <ArrowLeft size={22} />
        </Link>
        <DevasSymbol size={40} color="#7C2447" />
        <div className="w-6" />
      </div>
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-lg">
        <h1 className="text-2xl font-bold text-[#321B26] mb-1">Reset password</h1>
        <p className="text-[#8C7B85] text-sm mb-8">
          Enter your email and we'll send you a reset link.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className={`w-full px-4 py-3.5 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] bg-[#FCF7F0] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all ${errors.email ? 'border-red-400' : 'border-[#E8DDF2]'}`}
              {...register('email')}
            />
            {errors.email && <p role="alert" className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>
          {errors.root && (
            <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold shadow-md active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
          >
            {isLoading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  )
}
