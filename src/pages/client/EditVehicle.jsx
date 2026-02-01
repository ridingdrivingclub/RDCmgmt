import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicle, updateVehicle, uploadFile, getFileUrl } from '../../lib/supabase'
import { ArrowLeft, Upload, X, Camera, AlertCircle, CheckCircle } from 'lucide-react'

export default function EditVehicle() {
  const navigate = useNavigate()
  const { vehicleId } = useParams()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    year: '',
    make: '',
    model: '',
    trim: '',
    exterior_color: '',
    interior_color: '',
    vin: '',
    license_plate: '',
    current_mileage: '',
    status: 'stored',
    storage_location: '',
    registration_expires: '',
    insurance_expires: '',
    notes: ''
  })

  const [existingImages, setExistingImages] = useState([])
  const [newImages, setNewImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])

  useEffect(() => {
    loadVehicle()
  }, [vehicleId])

  const loadVehicle = async () => {
    try {
      const { data, error } = await getVehicle(vehicleId)

      if (error) throw error

      // Make sure user owns this vehicle
      if (data.owner_id !== user.id) {
        setError('You do not have permission to edit this vehicle')
        return
      }

      setFormData({
        year: data.year || '',
        make: data.make || '',
        model: data.model || '',
        trim: data.trim || '',
        exterior_color: data.exterior_color || '',
        interior_color: data.interior_color || '',
        vin: data.vin || '',
        license_plate: data.license_plate || '',
        current_mileage: data.current_mileage || '',
        status: data.status || 'stored',
        storage_location: data.storage_location || '',
        registration_expires: data.registration_expires || '',
        insurance_expires: data.insurance_expires || '',
        notes: data.notes || ''
      })

      if (data.images) {
        setExistingImages(data.images)
      }
    } catch (err) {
      console.error('Error loading vehicle:', err)
      setError('Failed to load vehicle')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setNewImages(prev => [...prev, ...files])

    // Create previews
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      // Prepare vehicle data
      const vehicleData = {
        year: parseInt(formData.year),
        make: formData.make,
        model: formData.model,
        trim: formData.trim || null,
        exterior_color: formData.exterior_color || null,
        interior_color: formData.interior_color || null,
        vin: formData.vin || null,
        license_plate: formData.license_plate || null,
        current_mileage: formData.current_mileage ? parseInt(formData.current_mileage) : null,
        status: formData.status,
        storage_location: formData.storage_location || null,
        registration_expires: formData.registration_expires || null,
        insurance_expires: formData.insurance_expires || null,
        notes: formData.notes || null
      }

      // Update vehicle
      const { error: vehicleError } = await updateVehicle(vehicleId, vehicleData)
      if (vehicleError) throw vehicleError

      // Upload new images if any
      for (const image of newImages) {
        const fileName = `${vehicleId}/${Date.now()}-${image.name}`
        const { error: uploadError } = await uploadFile('vehicle-images', fileName, image)
        if (uploadError) {
          console.error('Image upload error:', uploadError)
        }
      }

      setSuccess(true)
      setTimeout(() => {
        navigate(`/garage/${vehicleId}`)
      }, 1500)
    } catch (err) {
      console.error('Error updating vehicle:', err)
      setError(err.message || 'Failed to update vehicle')
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

  if (error && !formData.make) {
    return (
      <div className="animate-fade-in max-w-2xl">
        <div className="mb-6">
          <Link to="/garage" className="inline-flex items-center text-rdc-taupe hover:text-black">
            <ArrowLeft size={20} className="mr-2" />
            Back to Garage
          </Link>
        </div>
        <div className="card p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="font-display text-xl font-semibold text-black mb-2">Error</h2>
          <p className="text-rdc-taupe">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-6">
        <Link to={`/garage/${vehicleId}`} className="inline-flex items-center text-rdc-taupe hover:text-black">
          <ArrowLeft size={20} className="mr-2" />
          Back to Vehicle
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="page-title">Edit Vehicle</h1>
        <p className="text-rdc-taupe mt-1">
          Update your {formData.year} {formData.make} {formData.model}
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
          <span>Vehicle updated successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Basic Information</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Year *
              </label>
              <input
                type="number"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="input-field"
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Make *
              </label>
              <input
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                className="input-field"
                placeholder="Ferrari"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Model *
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                className="input-field"
                placeholder="488 GTB"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Trim
              </label>
              <input
                type="text"
                name="trim"
                value={formData.trim}
                onChange={handleChange}
                className="input-field"
                placeholder="Spider"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Exterior Color
              </label>
              <input
                type="text"
                name="exterior_color"
                value={formData.exterior_color}
                onChange={handleChange}
                className="input-field"
                placeholder="Rosso Corsa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Interior Color
              </label>
              <input
                type="text"
                name="interior_color"
                value={formData.interior_color}
                onChange={handleChange}
                className="input-field"
                placeholder="Nero Leather"
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Vehicle Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                VIN
              </label>
              <input
                type="text"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                className="input-field font-mono"
                placeholder="WVWZZZ3CZWE123456"
                maxLength={17}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                License Plate
              </label>
              <input
                type="text"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                className="input-field"
                placeholder="ABC1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Current Mileage
              </label>
              <input
                type="number"
                name="current_mileage"
                value={formData.current_mileage}
                onChange={handleChange}
                className="input-field"
                placeholder="12500"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="input-field"
              >
                <option value="stored">Stored</option>
                <option value="in_service">In Service</option>
                <option value="in_transit">In Transit</option>
                <option value="with_owner">With Owner</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
              Storage Location
            </label>
            <input
              type="text"
              name="storage_location"
              value={formData.storage_location}
              onChange={handleChange}
              className="input-field"
              placeholder="Main Facility - Bay 12"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Important Dates</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Registration Expires
              </label>
              <input
                type="date"
                name="registration_expires"
                value={formData.registration_expires}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-rdc-dark-gray mb-2">
                Insurance Expires
              </label>
              <input
                type="date"
                name="insurance_expires"
                value={formData.insurance_expires}
                onChange={handleChange}
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Photos</h2>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-rdc-taupe mb-2">Current photos:</p>
              <div className="grid grid-cols-3 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative aspect-video bg-rdc-cream rounded-lg overflow-hidden">
                    <img
                      src={image.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Image Upload */}
          <div className="border-2 border-dashed border-rdc-warm-gray rounded-lg p-6 text-center">
            <Camera size={32} className="text-rdc-taupe mx-auto mb-2" />
            <p className="text-sm text-rdc-taupe mb-2">Add more photos</p>
            <label className="btn-secondary cursor-pointer inline-block">
              <Upload size={16} className="inline mr-2" />
              Choose Files
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* New Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative aspect-video bg-rdc-cream rounded-lg overflow-hidden">
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="card p-6">
          <h2 className="section-title mb-4">Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-field min-h-[100px]"
            placeholder="Any special notes about this vehicle..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link to={`/garage/${vehicleId}`} className="btn-secondary">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
