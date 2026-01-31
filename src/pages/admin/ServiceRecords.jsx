import { useState, useEffect } from 'react'
import { getServiceRecords, getVehicles, createServiceRecord } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import { format } from 'date-fns'
import { Wrench, Plus, X, CheckCircle, AlertCircle } from 'lucide-react'

export default function AdminServiceRecords() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_date: format(new Date(), 'yyyy-MM-dd'),
    service_type: '',
    description: '',
    vendor_name: '',
    vendor_location: '',
    parts_cost: '',
    labor_cost: '',
    total_cost: '',
    mileage_at_service: '',
    notes: '',
    recommendations: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [recordsRes, vehiclesRes] = await Promise.all([
        getServiceRecords(),
        getVehicles()
      ])
      setRecords(recordsRes.data || [])
      setVehicles(vehiclesRes.data || [])
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
      if (name === 'parts_cost' || name === 'labor_cost') {
        const parts = parseFloat(updated.parts_cost) || 0
        const labor = parseFloat(updated.labor_cost) || 0
        updated.total_cost = (parts + labor).toString()
      }
      return updated
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const { error } = await createServiceRecord({
        ...formData,
        parts_cost: formData.parts_cost ? parseFloat(formData.parts_cost) : 0,
        labor_cost: formData.labor_cost ? parseFloat(formData.labor_cost) : 0,
        total_cost: formData.total_cost ? parseFloat(formData.total_cost) : 0,
        mileage_at_service: formData.mileage_at_service ? parseInt(formData.mileage_at_service) : null,
        created_by: user.id
      })

      if (error) throw error

      setSuccess('Service record added successfully')
      setShowModal(false)
      setFormData({
        vehicle_id: '',
        service_date: format(new Date(), 'yyyy-MM-dd'),
        service_type: '',
        description: '',
        vendor_name: '',
        vendor_location: '',
        parts_cost: '',
        labor_cost: '',
        total_cost: '',
        mileage_at_service: '',
        notes: '',
        recommendations: ''
      })
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const totalCosts = records.reduce((sum, r) => sum + (r.total_cost || 0), 0)

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
          <h1 className="page-title">Service Records</h1>
          <p className="text-rdc-taupe mt-1">{records.length} total records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={18} className="mr-2" />
          Add Record
        </button>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {records.length === 0 ? (
        <div className="card p-12 text-center">
          <Wrench size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">No service records</h3>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden mb-6">
            <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-rdc-cream text-xs font-semibold text-rdc-taupe uppercase tracking-wide">
              <div>Date</div>
              <div>Service</div>
              <div>Vehicle</div>
              <div>Vendor</div>
              <div className="text-right">Cost</div>
            </div>
            <div className="divide-y divide-rdc-cream">
              {records.map(record => (
                <div key={record.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr_100px] gap-2 md:gap-4 p-5 hover:bg-rdc-cream/50">
                  <div>
                    <div className="text-sm font-medium text-black">{format(new Date(record.service_date), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-rdc-taupe">{record.mileage_at_service?.toLocaleString()} mi</div>
                  </div>
                  <div>
                    <div className="text-sm text-black">{record.service_type}</div>
                    <div className="text-xs text-rdc-taupe line-clamp-1">{record.notes}</div>
                  </div>
                  <div className="text-sm text-rdc-dark-gray">
                    {record.vehicle?.year} {record.vehicle?.make} {record.vehicle?.model}
                  </div>
                  <div className="text-sm text-rdc-taupe">{record.vendor_name}</div>
                  <div className="text-sm font-semibold text-rdc-forest md:text-right">
                    ${record.total_cost?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-rdc-taupe mb-1">Total Service Costs</div>
              <div className="text-2xl font-bold text-rdc-forest">${totalCosts.toLocaleString()}</div>
            </div>
          </div>
        </>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-rdc-cream flex items-center justify-between">
              <h2 className="section-title">Add Service Record</h2>
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
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Vehicle *</label>
                <select name="vehicle_id" value={formData.vehicle_id} onChange={handleChange} className="input-field" required>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.year} {v.make} {v.model} - {v.owner?.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Service Date *</label>
                  <input type="date" name="service_date" value={formData.service_date} onChange={handleChange} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Service Type *</label>
                  <input name="service_type" value={formData.service_type} onChange={handleChange} className="input-field" required placeholder="e.g., Oil Change" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Vendor Name</label>
                  <input name="vendor_name" value={formData.vendor_name} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Mileage at Service</label>
                  <input type="number" name="mileage_at_service" value={formData.mileage_at_service} onChange={handleChange} className="input-field" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Parts Cost</label>
                  <input type="number" step="0.01" name="parts_cost" value={formData.parts_cost} onChange={handleChange} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Labor Cost</label>
                  <input type="number" step="0.01" name="labor_cost" value={formData.labor_cost} onChange={handleChange} className="input-field" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Total Cost</label>
                  <input type="number" step="0.01" name="total_cost" value={formData.total_cost} onChange={handleChange} className="input-field bg-rdc-cream" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows="3" />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
