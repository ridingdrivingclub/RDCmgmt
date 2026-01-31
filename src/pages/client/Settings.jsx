import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { updateProfile } from '../../lib/supabase'
import { User, Lock, Bell, CheckCircle, AlertCircle } from 'lucide-react'

export default function Settings() {
  const { user, profile, refreshProfile, updatePassword } = useAuth()

  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [phone, setPhone] = useState(profile?.phone || '')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setProfileSuccess(false)
    setProfileLoading(true)

    try {
      const { error } = await updateProfile(user.id, {
        full_name: fullName,
        phone: phone
      })

      if (error) throw error

      await refreshProfile()
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setPasswordLoading(true)

    try {
      const { error } = await updatePassword(newPassword)

      if (error) throw error

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordSuccess(true)
      setTimeout(() => setPasswordSuccess(false), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="page-title">Settings</h1>
        <p className="text-rdc-taupe mt-1">
          Manage your account and preferences
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto text-sm underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center">
            <User size={20} className="text-rdc-primary" />
          </div>
          <div>
            <h2 className="section-title">Profile Information</h2>
            <p className="text-sm text-rdc-taupe">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="input-field bg-rdc-cream"
              disabled
            />
            <p className="text-xs text-rdc-taupe mt-1">
              Contact support to change your email
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="+1 (555) 000-0000"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary"
            >
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
            {profileSuccess && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={16} />
                Saved
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center">
            <Lock size={20} className="text-rdc-primary" />
          </div>
          <div>
            <h2 className="section-title">Change Password</h2>
            <p className="text-sm text-rdc-taupe">Update your password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              minLength={8}
              required
            />
            <p className="text-xs text-rdc-taupe mt-1">
              Must be at least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={passwordLoading}
              className="btn-primary"
            >
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
            {passwordSuccess && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle size={16} />
                Password updated
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rdc-cream flex items-center justify-center">
            <Bell size={20} className="text-rdc-taupe" />
          </div>
          <div>
            <h2 className="section-title">Account</h2>
            <p className="text-sm text-rdc-taupe">Account information</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-rdc-cream">
            <span className="text-rdc-taupe">Member Since</span>
            <span className="text-black">
              {new Date(profile?.member_since || profile?.created_at).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-rdc-cream">
            <span className="text-rdc-taupe">Account Type</span>
            <span className="text-black capitalize">{profile?.role || 'Client'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
