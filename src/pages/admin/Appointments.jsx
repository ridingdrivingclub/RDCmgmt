import { useState, useEffect } from 'react'
import { getAppointments, getVehicles, getAllProfiles, createAppointment, updateAppointment } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format, isPast, isToday } from 'date-fns'
import { Calendar, Plus, X, CheckCircle, AlertCircle, Clock, MapPin } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const config = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-600' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
  }
  const c = config[status] || config.scheduled
  return <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${c.bg} ${c.text}`}>{status}</span>
}

export default function AdminAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [filter, setFilter] = useState('upcoming')

  const [formData, setFormData] = useState({
    vehicle_id: '',
    owner_id: '',
    title: '',
    appointment_type: '',
    scheduled_date: format(new Date(), 'yyyy-MM-dd'),
    scheduled_time: '09:00',
    vendor_name: '',
    vendor_address: '',
    status: 'scheduled',
    notes: '',
    internal_notes: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [appointmentsRes, vehiclesRes, profilesRes] = await Promise.all([
        getAppointments(),
        getVehicles(),
        getAllProfiles()
      ])
      setAppointments(appointmentsRes.data || [])
      setVehicles(vehiclesRes.data || [])
      setClients((profilesRes.data || []).filter(p => p.role === 'client'))
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const updated = { ...prev, [name]: value }
      if (name === 'vehicle_id' && value) {
        const vehicle = vehicles.find(v => v.id === value)
        if (vehicle) updated.owner_id = vehicle.owner_id
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { error } = await createAppointment({
        ...formData,
        created_by: user.id
      })

      if (error) throw error

      setSuccess('Appointment created successfully')
      setShowModal(false)
      setFormData({
        vehicle_id: '',
        owner_id: '',
        title: '',
        appointment_type: '',
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        scheduled_time: '09:00',
        vendor_name: '',
        vendor_address: '',
        status: 'scheduled',
        notes: '',
        internal_notes: ''
      })
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointment(appointmentId, { status: newStatus })
      loadData()
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const filteredAppointments = appointments.filter(apt => {
    const date = new Date(apt.scheduled_date)
    if (filter === 'upcoming') {
      return !isPast(date) || isToday(date)
    } else if (filter === 'past') {
      return isPast(date) && !isToday(date)
    }
    return true
  })

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
          <h1 className="page-title">Appointments</h1>
          <p className="text-rdc-taupe mt-1">{appointments.length} total appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} className="mr-2" />
          Schedule Appointment
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {['upcoming', 'past', 'all'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-rdc-forest text-white' : 'bg-rdc-cream text-rdc-dark-gray hover:bg-rdc-warm-gray'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card p-12 text-center">
          <Calendar size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">No appointments</h3>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map(apt => {
            const date = new Date(apt.scheduled_date)
            const isUpcoming = !isPast(date) || isToday(date)

            return (
              <div key={apt.id} className="card p-5 flex gap-4">
                <div className={`min-w-[60px] text-center py-3 px-4 rounded-lg ${isUpcoming ? 'bg-rdc-primary/10' : 'bg-rdc-cream'}`}>
                  <div className={`text-2xl font-bold ${isUpcoming ? 'text-rdc-primary' : 'text-rdc-dark-gray'}`}>
                    {format(date, 'd')}
                  </div>
                  <div className="text-xs text-rdc-taupe uppercase">{format(date, 'MMM')}</div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-black">{apt.title}</h3>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="text-sm text-rdc-dark-gray mb-2">
                    {apt.vehicle?.year} {apt.vehicle?.make} {apt.vehicle?.model}
                    {apt.owner?.full_name && ` • ${apt.owner.full_name}`}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-rdc-taupe">
                    {apt.scheduled_time && (
                      <span className="flex items-center gap-1"><Clock size={14} />{apt.scheduled_time.substring(0, 5)}</span>
                    )}
                    {apt.vendor_name && (
                      <span className="flex items-center gap-1"><MapPin size={14} />{apt.vendor_name}</span>
                    )}
                  </div>
                  {apt.notes && <div className="text-sm text-rdc-taupe mt-2 italic">{apt.notes}</div>}
                </div>
                <div className="flex flex-col gap-2">
                  <select
                    value={apt.status}
                    onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                    className="input-field py-1 text-sm"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-rdc-cream flex items-center justify-between">
              <h2 className="section-title">Schedule Appointment</h2>
              <button onClick={() => setShowModal(false)} className="text-rdc-taupe hover:text-black"><X size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                  <AlertCircle size={20} /><span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} className="input-field" required placeholder="e.g., Annual Service" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Type</label>
                  <input name="appointment_type" value={formData.appointment_type} onChange={handleChange} className="input-field" placeholder="e.g., Service, Registration" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Vehicle *</label>
                <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="input-field" required>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.year} {v.make} {v.model} - {v.owner?.full_name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Date *</label>
                  <input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Time</label>
                  <input type="time" name="scheduled_time" value={formData.scheduled_time} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Vendor/Location</label>
                  <input name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Address</label>
                  <input name="vendor_address" value={formData.vendor_address} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Notes (visible to client)</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows="2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Internal Notes (admin only)</label>
                <textarea name="internal_notes" value={formData.internal_notes} onChange={handleChange} className="input-field" rows="2" />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Schedule Appointment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
