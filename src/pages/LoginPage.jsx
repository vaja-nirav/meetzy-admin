import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Zap, LogIn, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../api/auth.api'
import useAuthStore from '../store/authStore'
import LoadingSpinner from '../components/ui/LoadingSpinner'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setLoginError('')
    try {
      const res = await authApi.login(data.email, data.password)
      const token = res.token || res.adminToken || res.accessToken
      if (!token) throw new Error('No token received')
      login(token)
      toast.success('Welcome back, Admin!')
      navigate('/dashboard')
    } catch {
      setLoginError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-meetzy-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-meetzy-card border border-meetzy-border rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-meetzy-purple flex items-center justify-center mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-2xl">Meetzy Admin</h1>
          <p className="text-meetzy-muted text-sm mt-1">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-meetzy-muted text-sm font-medium mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@meetzy.com"
              className="w-full bg-meetzy-hover border border-meetzy-border text-meetzy-text rounded-xl px-4 py-3 focus:border-meetzy-purple focus:outline-none transition-colors placeholder-meetzy-border"
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
              })}
            />
            {errors.email && (
              <p className="text-meetzy-red text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-meetzy-muted text-sm font-medium mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full bg-meetzy-hover border border-meetzy-border text-meetzy-text rounded-xl px-4 py-3 pr-12 focus:border-meetzy-purple focus:outline-none transition-colors placeholder-meetzy-border"
                {...register('password', { required: 'Password is required', minLength: 1 })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-meetzy-muted hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-meetzy-red text-xs mt-1">{errors.password.message}</p>
            )}
          </div>

          {loginError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <p className="text-meetzy-red text-sm">{loginError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-meetzy-purple hover:bg-purple-700 text-white rounded-xl py-3 font-medium transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Sign In</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
