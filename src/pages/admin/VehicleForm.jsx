import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicle, createVehicle, updateVehicle, getAllProfiles, uploadFile, getFileUrl } from '../../lib/supabase'
import { ArrowLeft, Save, Upload, AlertCircle, CheckCircle } from 'lucide-react'

export default function AdminVehicleForm() {
  const { vehicleId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const isEditing = !!vehicleId
  const preselectedClient = searchParams.get('client')

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    owner_id: preselectedClient || '',
    year: '',
    make: '',
    model: '',
    trim: '',
    color: '',
    interior_color: '',
    vin: '',
    license_plate: '',
    status: 'ready',
    location: '',
    mileage: '',
    purchase_date: '',
    purchase_price: '',
    registration_expiry: '',
    insurance_expiry: '',
    notes: '',
    special_instructions: '',
    primary_image_url: ''
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    loadData()
  }, [vehicleId])

  const loadData = async () => {
    try {
      const profilesRes = await getAllProfiles()
      const clientProfiles = (profilesRes.data || []).filter(p => p.role === 'client')
      setClients(clientProfiles)

      if (isEditing) {
        const { data, error } = await getVehicle(vehicleId)
        if (error) throw error
        if (data) {
          setFormData({
            owner_id: data.owner_id || '',
            year: data.year || '',
            make: data.make || '',
            model: data.model || '',
            trim: data.trim || '',
            color: data.color || '',
            interior_color: data.interior_color || '',
            vin: data.vin || '',
            license_plate: data.license_plate || '',
            status: data.status || 'ready',
            location: data.location || '',
            mileage: data.mileage || '',
            purchase_date: data.purchase_date || '',
            purchase_price: data.purchase_price || '',
            registration_expiry: data.registration_expiry || '',
            insurance_expiry: data.insurance_expiry || '',
            notes: data.notes || '',
            special_instructions: data.special_instructions || '',
            primary_image_url: data.primary_image_url || ''
          })
          setImagePreview(data.primary_image_url || '')
        }
      }
    } catch (err) {
      console.error('Error loading data:', err)
      setError('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      let imageUrl = formData.primary_image_url

      // Upload image if changed
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`
        const { data: uploadData, error: uploadError } = await uploadFile(
          'vehicle-images',
          fileName,
          imageFile
        )
        if (uploadError) throw uploadError
        imageUrl = getFileUrl('vehicle-images', fileName)
      }

      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        primary_image_url: imageUrl
      }

      // Remove empty strings
      Object.keys(vehicleData).forEach(key => {
        if (vehicleData[key] === '') vehicleData[key] = null
      })

      if (isEditing) {
        const { error } = await updateVehicle(vehicleId, vehicleData)
        if (error) throw error
      } else {
        const { error } = await createVehicle(vehicleData)
        if (error) throw error
      }

      setSuccess(true)
      setTimeout(() => navigate('/admin/vehicles'), 1500)
    } catch (err) {
      console.error('Error saving vehicle:', err)
      setError(err.message || 'Failed to save vehicle')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-forest border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link to="/admin/vehicles" className="inline-flex items-center gap-2 text-rdc-taupe hover:text-rdc-primary mb-6">
        <ArrowLeft size={20} />
        Back to Vehicles
      </Link>

      <h1 className="page-title mb-8">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>Vehicle saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Owner */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Owner</h2>
          <select
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            className="input-field"
            required
          >
            <option value="">Select a client</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.full_name} ({client.email})</option>
            ))}
          </select>
        </div>

        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Year *</label>
              <input name="year" type="number" value={formData.year} onChange={handleChange} className="input-field" required min="1900" max="2030" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Make *</label>
              <input name="make" value={formData.make} onChange={handleChange} className="input-field" required placeholder="e.g., Porsche" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Model *</label>
              <input name="model" value={formData.model} onChange={handleChange} className="input-field" required placeholder="e.g., 911 GT3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Trim</label>
              <input name="trim" value={formData.trim} onChange={handleChange} className="input-field" placeholder="e.g., RS" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Exterior Color</label>
              <input name="color" value={formData.color} onChange={handleChange} className="input-field" placeholder="e.g., GT Silver Metallic" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Interior Color</label>
              <input name="interior_color" value={formData.interior_color} onChange={handleChange} className="input-field" placeholder="e.g., Black Leather" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">VIN</label>
              <input name="vin" value={formData.vin} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">License Plate</label>
              <input name="license_plate" value={formData.license_plate} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Mileage</label>
              <input name="mileage" type="number" value={formData.mileage} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        {/* Status & Location */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Status & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="input-field">
                <option value="ready">Ready</option>
                <option value="in_service">In Service</option>
                <option value="stored">Stored</option>
                <option value="in_transit">In Transit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Location</label>
              <input name="location" value={formData.location} onChange={handleChange} className="input-field" placeholder="e.g., Main Garage - Bay 1" />
            </div>
          </div>
        </div>

        {/* Key Dates */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Key Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Purchase Date</label>
              <input name="purchase_date" type="date" value={formData.purchase_date} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Registration Expiry</label>
              <input name="registration_expiry" type="date" value={formData.registration_expiry} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Insurance Expiry</label>
              <input name="insurance_expiry" type="date" value={formData.insurance_expiry} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Primary Image</h2>
          <div className="flex items-start gap-6">
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg" />
            )}
            <label className="flex-1 border-2 border-dashed border-rdc-warm-gray rounded-lg p-6 text-center cursor-pointer hover:border-rdc-primary transition-colors">
              <Upload size={24} className="mx-auto mb-2 text-rdc-taupe" />
              <span className="text-sm text-rdc-taupe">Click to upload image</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Notes</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">General Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} className="input-field" rows="3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Special Instructions</label>
              <textarea name="special_instructions" value={formData.special_instructions} onChange={handleChange} className="input-field" rows="3" placeholder="e.g., Premium fuel only, cover when stored" />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/admin/vehicles" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
            {saving ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Vehicle
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
