import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getInvitationByToken } from '../../lib/supabase'
import Logo from '../../components/Logo'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignUp() {
  const navigate = useNavigate()
  const { token } = useParams()
  const { signUp } = useAuth()

  const [invitation, setInvitation] = useState(null)
  const [invitationLoading, setInvitationLoading] = useState(!!token)
  const [invitationError, setInvitationError] = useState('')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Check invitation token
  useEffect(() => {
    if (token) {
      checkInvitation()
    }
  }, [token])

  const checkInvitation = async () => {
    try {
      const { data, error } = await getInvitationByToken(token)

      if (error || !data) {
        setInvitationError('This invitation is invalid or has expired.')
        return
      }

      setInvitation(data)
      setEmail(data.email)
      setFullName(data.full_name || '')
    } catch (err) {
      setInvitationError('Error verifying invitation')
    } finally {
      setInvitationLoading(false)
    }
  }

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validate
    const passwordError = validatePassword()
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, fullName)

      if (error) {
        if (error.message.includes('already registered')) {
          setError('This email is already registered. Try signing in instead.')
        } else {
          setError(error.message)
        }
        return
      }

      setSuccess(true)
    } catch (err) {
      setError('An unexpected error occurred')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Loading invitation
  if (invitationLoading) {
    return (
      <div className="min-h-screen bg-rdc-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-rdc-primary border-t-transparent mx-auto mb-4" />
          <p className="text-rdc-taupe">Verifying invitation...</p>
        </div>
      </div>
    )
  }

  // Invalid invitation
  if (token && invitationError) {
    return (
      <div className="min-h-screen bg-rdc-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-rdc-cream max-w-md w-full text-center">
          <Logo className="mb-6" />
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h1 className="font-display text-xl font-semibold text-black mb-2">
            Invalid Invitation
          </h1>
          <p className="text-rdc-taupe mb-6">{invitationError}</p>
          <Link to="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-rdc-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-rdc-cream max-w-md w-full text-center">
          <Logo className="mb-6" />
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h1 className="font-display text-xl font-semibold text-black mb-2">
            Account Created!
          </h1>
          <p className="text-rdc-taupe mb-6">
            Please check your email to verify your account, then sign in.
          </p>
          <Link to="/login" className="btn-primary inline-block">
            Go to Login
          </Link>
        </div>
      </div>
    )
  }

  // No invitation (require token)
  if (!token) {
    return (
      <div className="min-h-screen bg-rdc-cream flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-rdc-cream max-w-md w-full text-center">
          <Logo className="mb-6" />
          <h1 className="font-display text-xl font-semibold text-black mb-2">
            Invitation Required
          </h1>
          <p className="text-rdc-taupe mb-6">
            Access to the Digital Garage is by invitation only.
            Please contact your Riding & Driving Club representative
            to receive an invitation.
          </p>
          <Link to="/login" className="btn-secondary inline-block">
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rdc-cream flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <div className="max-w-md text-center">
          <Logo size="large" className="mb-8" />
          <h2 className="font-display text-2xl text-rdc-dark-gray mb-4">
            Welcome to the Club
          </h2>
          <p className="text-rdc-taupe leading-relaxed">
            You've been invited to join the Riding & Driving Club
            Digital Garage. Complete your registration to access
            your personal vehicle management portal.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo className="mb-4" />
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8 border border-rdc-cream">
            <h1 className="font-display text-2xl font-semibold text-black mb-2">
              Create your account
            </h1>
            <p className="text-rdc-taupe mb-8">
              Complete your registration for <span className="font-medium text-rdc-dark-gray">{email}</span>
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-field"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  className="input-field bg-rdc-cream"
                  disabled
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-12"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-rdc-taupe hover:text-rdc-dark-gray"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-rdc-taupe">
                  Must be at least 8 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-rdc-taupe">
              Already have an account?{' '}
              <Link to="/login" className="text-rdc-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
