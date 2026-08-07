import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { DevasSymbol } from '@/components/ui/DevasSymbol'

const signUpSchema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type SignUpFormData = z.infer<typeof signUpSchema>

export function SignUpPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const { register, handleSubmit, formState: { errors }, setError } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  })

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError('root', { message: error.message })
      } else {
        setConfirmed(true)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (confirmed) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-[#FCF7F0] px-8 text-center">
        <OrgBlobs variant="auth" />
        <div className="relative z-10 max-w-xs">
          <div className="w-16 h-16 rounded-full bg-[#DDE9D3] flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">✓</span>
          </div>
          <h2 className="text-2xl font-bold text-[#321B26] mb-3">Check your inbox</h2>
          <p className="text-[#8C7B85] text-sm leading-relaxed mb-8">
            We've sent a confirmation link to your email. Please verify to begin your journey.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FCF7F0] overflow-hidden">
      <OrgBlobs variant="auth" />
      <div className="relative z-10 flex items-center justify-center pt-14 pb-8">
        <DevasSymbol size={48} color="#7C2447" />
      </div>
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-lg">
        <h1 className="text-2xl font-bold text-[#321B26] mb-1">Create your account</h1>
        <p className="text-[#8C7B85] text-sm mb-8">Begin your journey with Devas Unlimited</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="full_name" className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              className={`w-full px-4 py-3.5 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] bg-[#FCF7F0] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all duration-150 ${errors.full_name ? 'border-red-400' : 'border-[#E8DDF2]'}`}
              {...register('full_name')}
              aria-invalid={Boolean(errors.full_name)}
            />
            {errors.full_name && <p role="alert" className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              className={`w-full px-4 py-3.5 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] bg-[#FCF7F0] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all duration-150 ${errors.email ? 'border-red-400' : 'border-[#E8DDF2]'}`}
              {...register('email')}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && <p role="alert" className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-[#4A3540] mb-1.5 uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Min 8 characters"
                className={`w-full px-4 py-3.5 pr-12 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] bg-[#FCF7F0] outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] transition-all duration-150 ${errors.password ? 'border-red-400' : 'border-[#E8DDF2]'}`}
                {...register('password')}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7B85]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p role="alert" className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
          </div>

          {errors.root && (
            <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold tracking-wide shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-60 mt-2"
          >
            {isLoading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-[#8C7B85]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7C2447] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
