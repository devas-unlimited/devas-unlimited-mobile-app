import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OrgBlobs } from '@/components/ui/OrgBlobs'
import { DevasSymbol } from '@/components/ui/DevasSymbol'
import { useToast } from '@/components/feedback/Toast'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'

  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (error) {
        setError('root', { message: error.message === 'Invalid login credentials'
          ? 'The email or password you entered is incorrect.'
          : error.message
        })
      } else {
        navigate(from, { replace: true })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) toast(error.message, 'error')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-[#FCF7F0] overflow-hidden">
      <OrgBlobs variant="auth" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-center pt-14 pb-8">
        <DevasSymbol size={48} color="#7C2447" />
      </div>

      {/* Card */}
      <div className="relative z-10 flex-1 bg-white rounded-t-[32px] px-6 pt-8 pb-10 shadow-lg">
        <h1 className="text-2xl font-bold text-[#321B26] mb-1">Welcome back</h1>
        <p className="text-[#8C7B85] text-sm mb-8">
          Continue your personal journey with Devas Unlimited
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
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
              className={`w-full px-4 py-3.5 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] transition-all duration-150 outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] bg-[#FCF7F0] ${
                errors.email ? 'border-red-400' : 'border-[#E8DDF2]'
              }`}
              {...register('email')}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={Boolean(errors.email)}
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-[#4A3540] uppercase tracking-wide">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-[#7C2447] font-medium hover:underline">
                Forgot password
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-3.5 pr-12 rounded-2xl border text-[#321B26] text-sm placeholder-[#C4B5BD] transition-all duration-150 outline-none focus:ring-2 focus:ring-[#7C2447]/20 focus:border-[#7C2447] bg-[#FCF7F0] ${
                  errors.password ? 'border-red-400' : 'border-[#E8DDF2]'
                }`}
                {...register('password')}
                aria-describedby={errors.password ? 'password-error' : undefined}
                aria-invalid={Boolean(errors.password)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8C7B85] touch-target"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1 text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Root error */}
          {errors.root && (
            <div role="alert" className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
              <p className="text-sm text-red-600">{errors.root.message}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-[#7C2447] text-white rounded-full text-sm font-semibold tracking-wide shadow-md active:scale-[0.98] transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
          >
            {isLoading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#F0E8F0]" />
          <span className="text-xs text-[#8C7B85] font-medium">or continue with</span>
          <div className="flex-1 h-px bg-[#F0E8F0]" />
        </div>

        {/* Google */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={googleLoading}
          className="w-full py-3.5 border border-[#E8DDF2] rounded-full text-sm font-semibold text-[#321B26] flex items-center justify-center gap-3 bg-white active:bg-[#FCF7F0] transition-colors duration-150 disabled:opacity-60"
        >
          <GoogleIcon />
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {/* Sign up */}
        <p className="text-center mt-8 text-sm text-[#8C7B85]">
          New here?{' '}
          <Link to="/signup" className="text-[#7C2447] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
