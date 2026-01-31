import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAllInvitations, createInvitation } from '../../lib/supabase'
import { format } from 'date-fns'
import { Mail, Plus, Copy, CheckCircle, AlertCircle, Clock, Check, X } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
    accepted: { bg: 'bg-green-100', text: 'text-green-700', icon: Check },
    expired: { bg: 'bg-gray-100', text: 'text-gray-600', icon: X },
    revoked: { bg: 'bg-red-100', text: 'text-red-600', icon: X },
  }
  const c = config[status] || config.pending
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium capitalize ${c.bg} ${c.text}`}>
      <Icon size={12} />
      {status}
    </span>
  )
}

export default function AdminInvitations() {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  const [formData, setFormData] = useState({
    email: '',
    full_name: ''
  })

  useEffect(() => {
    loadInvitations()
  }, [])

  const loadInvitations = async () => {
    try {
      const { data } = await getAllInvitations()
      setInvitations(data || [])
    } catch (err) {
      console.error('Error loading invitations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { data, error } = await createInvitation(
        formData.email,
        formData.full_name,
        user.id
      )

      if (error) throw error

      setSuccess('Invitation sent successfully!')
      setShowModal(false)
      setFormData({ email: '', full_name: '' })
      loadInvitations()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      if (err.message?.includes('duplicate')) {
        setError('An invitation has already been sent to this email')
      } else {
        setError(err.message || 'Failed to create invitation')
      }
    } finally {
      setSaving(false)
    }
  }

  const copyInviteLink = (token) => {
    const link = `${window.location.origin}/signup/${token}`
    navigator.clipboard.writeText(link)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const pendingCount = invitations.filter(i => i.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-forest border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">Client Invitations</h1>
          <p className="text-rdc-taupe mt-1">
            {pendingCount} pending invitation{pendingCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} className="mr-2" />
          Invite Client
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="card p-12 text-center">
          <Mail size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">No invitations sent</h3>
          <p className="text-rdc-taupe mb-4">Invite your first client to get started</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">Invite Client</button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-rdc-cream text-xs font-semibold text-rdc-taupe uppercase tracking-wide">
            <div>Email</div>
            <div>Name</div>
            <div>Status</div>
            <div>Sent</div>
            <div></div>
          </div>

          <div className="divide-y divide-rdc-cream">
            {invitations.map(inv => (
              <div key={inv.id} className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_100px] gap-2 md:gap-4 p-5 items-center">
                <div className="text-sm text-black">{inv.email}</div>
                <div className="text-sm text-rdc-dark-gray">{inv.full_name || '—'}</div>
                <div><StatusBadge status={inv.status} /></div>
                <div className="text-sm text-rdc-taupe">
                  {format(new Date(inv.created_at), 'MMM d, yyyy')}
                </div>
                <div>
                  {inv.status === 'pending' && (
                    <button
                      onClick={() => copyInviteLink(inv.token)}
                      className="flex items-center gap-1 text-sm text-rdc-primary hover:underline"
                    >
                      {copiedId === inv.token ? (
                        <><CheckCircle size={14} /> Copied</>
                      ) : (
                        <><Copy size={14} /> Copy Link</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-rdc-cream flex items-center justify-between">
              <h2 className="section-title">Invite New Client</h2>
              <button onClick={() => setShowModal(false)} className="text-rdc-taupe hover:text-black">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="input-field"
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="input-field"
                  placeholder="John Smith"
                />
              </div>

              <p className="text-sm text-rdc-taupe">
                An invitation email will be sent with a unique signup link.
                The invitation expires in 7 days.
              </p>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
