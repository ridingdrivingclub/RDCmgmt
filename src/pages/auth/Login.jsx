import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Logo from '../../components/Logo'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, isAdmin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        if (error.message.includes('Invalid login')) {
          setError('Invalid email or password')
        } else {
          setError(error.message)
        }
        return
      }

      // Navigation handled by auth state change
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-rdc-cream flex">
      {/* Left Panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Logo size="large" className="mb-8" />
          <h2 className="font-display text-2xl text-rdc-dark-gray mb-4">
            Digital Garage
          </h2>
          <p className="text-rdc-taupe leading-relaxed">
            Your personal vehicle collection management portal.
            Track your vehicles, service history, and communicate
            with your dedicated concierge team.
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Logo className="mb-4" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-rdc-cream">
            <h1 className="font-display text-2xl font-semibold text-black mb-2">
              Welcome back
            </h1>
            <p className="text-rdc-taupe mb-8">
              Sign in to access your garage
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-rdc-dark-gray">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-rdc-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rdc-taupe hover:text-rdc-dark-gray"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-rdc-taupe">
              Don't have an account?{' '}
              <span className="text-rdc-dark-gray">
                Contact your Riding & Driving Club representative for an invitation.
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
