import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicles, createServiceRecord, uploadFile } from '../../lib/supabase'
import { ArrowLeft, Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react'

export default function AddServiceRecord() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: 'maintenance',
    service_date: new Date().toISOString().split('T')[0],
    mileage: '',
    description: '',
    performed_by: '',
    cost: '',
    notes: ''
  })

  const [documents, setDocuments] = useState([])

  useEffect(() => {
    loadVehicles()
  }, [user])

  const loadVehicles = async () => {
    try {
      const { data, error } = await getVehicles(user.id)
      if (error) throw error
      setVehicles(data || [])

      // Pre-select first vehicle if available
      if (data && data.length > 0) {
        setFormData(prev => ({ ...prev, vehicle_id: data[0].id }))
      }
    } catch (err) {
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files)
    setDocuments(prev => [...prev, ...files])
  }

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.vehicle_id) {
      setError('Please select a vehicle')
      return
    }

    setSaving(true)

    try {
      // Prepare service record data
      const recordData = {
        vehicle_id: formData.vehicle_id,
        service_type: formData.service_type,
        service_date: formData.service_date,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        description: formData.description,
        performed_by: formData.performed_by || null,
        cost: formData.cost ? parseFloat(formData.cost) : null,
        notes: formData.notes || null
      }

      // Create service record
      const { data: record, error: recordError } = await createServiceRecord(recordData)
      if (recordError) throw recordError

      // Upload documents if any
      for (const doc of documents) {
        const fileName = `${record.id}/${Date.now()}-${doc.name}`
        const { error: uploadError } = await uploadFile('documents', fileName, doc)
        if (uploadError) {
          console.error('Document upload error:', uploadError)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        navigate('/service-history')
      }, 1500)
    } catch (err) {
      console.error('Error creating service record:', err)
      setError(err.message || 'Failed to create service record')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-primary border-t-transparent" />
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-6">
          <Link to="/service-history" className="inline-flex items-center text-rdc-taupe hover:text-black">
            <ArrowLeft size={20} className="mr-2" />
            Back to Service History
          </Link>
        </div>
        <div className="card p-8 text-center">
          <FileText size={48} className="text-rdc-taupe mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-black mb-2">No Vehicles Yet</h2>
          <p className="text-rdc-taupe mb-4">You need to add a vehicle before logging service records.</p>
          <Link to="/garage/add" className="btn-primary">Add Your First Vehicle</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <Link to="/service-history" className="inline-flex items-center text-rdc-taupe hover:text-black">
          <ArrowLeft size={20} className="mr-2" />
          Back to Service History
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="page-title">Add Service Record</h1>
        <p className="text-rdc-taupe mt-1">
          Log maintenance, repairs, or other service work
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>Service record added successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Selection */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Vehicle</h2>

          <div>
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Select Vehicle *
            </label>
            <select
              name="vehicle_id"
              value={formData.vehicle_id}
              onChange={handleChange}
              className="input-field"
              required
            >
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Service Details */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Service Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Service Type *
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="inspection">Inspection</option>
                <option value="upgrade">Upgrade</option>
                <option value="detailing">Detailing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Service Date *
              </label>
              <input
                type="date"
                name="service_date"
                value={formData.service_date}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Mileage at Service
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                className="input-field"
                placeholder="12500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Cost ($)
              </label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                className="input-field"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Description *
            </label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Oil change, brake inspection, tire rotation..."
              required
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Performed By
            </label>
            <input
              type="text"
              name="performed_by"
              value={formData.performed_by}
              onChange={handleChange}
              className="input-field"
              placeholder="Shop name or mechanic"
            />
          </div>
        </div>

        {/* Documents */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Documents</h2>
          <p className="text-sm text-rdc-taupe mb-4">
            Upload receipts, invoices, or other documentation
          </p>

          <div className="border-2 border-dashed border-rdc-warm-gray rounded-lg p-6 text-center">
            <FileText size={32} className="text-rdc-taupe mx-auto mb-2" />
            <p className="text-sm text-rdc-taupe mb-2">Drag files here or click to upload</p>
            <label className="btn-secondary cursor-pointer inline-block">
              <Upload size={16} className="inline mr-2" />
              Choose Files
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                multiple
                onChange={handleDocumentUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Document List */}
          {documents.length > 0 && (
            <div className="mt-4 space-y-2">
              {documents.map((doc, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-rdc-cream rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-rdc-taupe" />
                    <span className="text-sm text-black">{doc.name}</span>
                    <span className="text-xs text-rdc-taupe">
                      ({(doc.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Additional Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field min-h-[100px]"
            placeholder="Any additional notes about this service..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/service-history" className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Add Service Record'}
          </button>
        </div>
      </form>
    </div>
  )
}
