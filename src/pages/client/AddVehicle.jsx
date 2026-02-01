import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { createVehicle, uploadFile, getFileUrl } from '../../lib/supabase'
import { ArrowLeft, Save, Upload, AlertCircle, CheckCircle, Car } from 'lucide-react'

export default function AddVehicle() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
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
    registration_expiry: '',
    insurance_expiry: '',
    notes: '',
    special_instructions: ''
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

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
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const fileName = `${user.id}/${Date.now()}-${imageFile.name}`
        const { data: uploadData, error: uploadError } = await uploadFile(
          'vehicle-images',
          fileName,
          imageFile
        )
        if (uploadError) throw uploadError
        imageUrl = getFileUrl('vehicle-images', fileName)
      }

      const vehicleData = {
        owner_id: user.id,
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || null,
        color: formData.color || null,
        interior_color: formData.interior_color || null,
        vin: formData.vin || null,
        license_plate: formData.license_plate || null,
        status: formData.status,
        location: formData.location || null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        purchase_date: formData.purchase_date || null,
        registration_expiry: formData.registration_expiry || null,
        insurance_expiry: formData.insurance_expiry || null,
        notes: formData.notes || null,
        special_instructions: formData.special_instructions || null,
        primary_image_url: imageUrl
      }

      const { error } = await createVehicle(vehicleData)
      if (error) throw error

      setSuccess(true)
      setTimeout(() => navigate('/garage'), 1500)
    } catch (err) {
      console.error('Error saving vehicle:', err)
      setError(err.message || 'Failed to save vehicle')
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="font-display text-xl font-semibold text-black mb-2">Vehicle Added!</h2>
          <p className="text-rdc-taupe">Redirecting to your garage...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      <Link to="/garage" className="inline-flex items-center gap-2 text-rdc-taupe hover:text-rdc-primary mb-6">
        <ArrowLeft size={20} />
        Back to Garage
      </Link>

      <h1 className="page-title mb-8">Add New Vehicle</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Vehicle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Year *</label>
              <input
                name="year"
                type="number"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                required
                min="1900"
                max="2030"
                placeholder="2024"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Make *</label>
              <input
                name="make"
                value={formData.make}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="e.g., Porsche"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Model *</label>
              <input
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field"
                required
                placeholder="e.g., 911 GT3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Trim</label>
              <input
                name="trim"
                value={formData.trim}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., RS"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Exterior Color</label>
              <input
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., GT Silver Metallic"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Interior Color</label>
              <input
                name="interior_color"
                value={formData.interior_color}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Black Leather"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">VIN</label>
              <input
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="input-field"
                placeholder="Vehicle Identification Number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">License Plate</label>
              <input
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Current Mileage</label>
              <input
                name="mileage"
                type="number"
                value={formData.mileage}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Status & Location */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Status & Location</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="ready">Ready</option>
                <option value="in_service">In Service</option>
                <option value="stored">Stored</option>
                <option value="in_transit">In Transit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Location</label>
              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Home Garage"
              />
            </div>
          </div>
        </div>

        {/* Key Dates */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Key Dates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Purchase Date</label>
              <input
                name="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Registration Expiry</label>
              <input
                name="registration_expiry"
                type="date"
                value={formData.registration_expiry}
                onChange={handleChange}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Insurance Expiry</label>
              <input
                name="insurance_expiry"
                type="date"
                value={formData.insurance_expiry}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Photo</h2>
          <div className="flex items-start gap-6">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="w-32 h-24 object-cover rounded-lg" />
            ) : (
              <div className="w-32 h-24 bg-rdc-cream rounded-lg flex items-center justify-center">
                <Car size={32} className="text-rdc-warm-gray" />
              </div>
            )}
            <label className="flex-1 border-2 border-dashed border-rdc-warm-gray rounded-lg p-6 text-center cursor-pointer hover:border-rdc-primary transition-colors">
              <Upload size={24} className="mx-auto mb-2 text-rdc-taupe" />
              <span className="text-sm text-rdc-taupe">Click to upload a photo of your vehicle</span>
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
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Any additional information about this vehicle..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">Special Instructions</label>
              <textarea
                name="special_instructions"
                value={formData.special_instructions}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="e.g., Premium fuel only, cover when stored"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to="/garage" className="btn-secondary">Cancel</Link>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? (
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
