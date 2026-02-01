import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicle, getServiceRecords, getDocuments } from '../../lib/supabase'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Car,
  MapPin,
  Calendar,
  FileText,
  MessageCircle,
  Wrench,
  AlertCircle,
  Edit,
  Plus
} from 'lucide-react'

const StatusBadge = ({ status }) => {
  const statusConfig = {
    ready: { bg: 'bg-rdc-forest/20', text: 'text-rdc-forest', label: 'Ready' },
    with_owner: { bg: 'bg-rdc-forest/20', text: 'text-rdc-forest', label: 'With Owner' },
    in_service: { bg: 'bg-rdc-tan/20', text: 'text-rdc-tan', label: 'In Service' },
    stored: { bg: 'bg-rdc-olive/20', text: 'text-rdc-olive', label: 'Stored' },
    in_transit: { bg: 'bg-rdc-burgundy/20', text: 'text-rdc-burgundy', label: 'In Transit' },
  }
  const config = statusConfig[status] || statusConfig.stored
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

const InfoCard = ({ label, value }) => (
  <div className="bg-rdc-cream rounded-lg p-4">
    <div className="text-xs text-rdc-taupe mb-1">{label}</div>
    <div className="text-sm font-medium text-black">{value || '—'}</div>
  </div>
)

export default function VehicleDetail() {
  const { vehicleId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [vehicle, setVehicle] = useState(null)
  const [serviceRecords, setServiceRecords] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    loadData()
  }, [vehicleId])

  const loadData = async () => {
    try {
      const [vehicleRes, servicesRes, docsRes] = await Promise.all([
        getVehicle(vehicleId),
        getServiceRecords(vehicleId),
        getDocuments(null, vehicleId)
      ])

      if (vehicleRes.error) throw vehicleRes.error

      setVehicle(vehicleRes.data)
      setServiceRecords(servicesRes.data || [])
      setDocuments(docsRes.data || [])

      // Check if current user owns this vehicle
      setIsOwner(vehicleRes.data.owner_id === user?.id)
    } catch (err) {
      console.error('Error loading vehicle:', err)
      setError('Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !vehicle) {
    return (
      <div className="card p-8 text-center">
        <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-black mb-2">
          {error || 'Vehicle not found'}
        </h3>
        <Link to="/garage" className="btn-primary inline-block mt-4">
          Back to Garage
        </Link>
      </div>
    )
  }

  // Get the primary image from images array or primary_image_url
  const primaryImage = vehicle.images?.find(img => img.is_primary)?.image_url
    || vehicle.images?.[0]?.image_url
    || vehicle.primary_image_url

  return (
    <div className="animate-fade-in">
      {/* Back Button */}
      <Link
        to="/garage"
        className="inline-flex items-center gap-2 text-rdc-taupe hover:text-rdc-primary mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Garage</span>
      </Link>

      {/* Hero Image */}
      <div className="relative rounded-2xl overflow-hidden mb-8 h-64 md:h-96 bg-rdc-cream">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car size={64} className="text-rdc-warm-gray" />
          </div>
        )}
        <div className="absolute bottom-4 left-4">
          <StatusBadge status={vehicle.status} />
        </div>
      </div>

      {/* Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
        <div>
          <div className="text-sm text-rdc-taupe">{vehicle.year}</div>
          <h1 className="font-display text-3xl font-semibold text-black">
            {vehicle.make} {vehicle.model}
          </h1>
          {vehicle.trim && (
            <div className="text-rdc-dark-gray">{vehicle.trim}</div>
          )}
          {(vehicle.exterior_color || vehicle.color) && (
            <div className="text-rdc-taupe mt-1">{vehicle.exterior_color || vehicle.color}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-3">
          {isOwner && (
            <Link
              to={`/garage/${vehicleId}/edit`}
              className="btn-secondary flex items-center gap-2"
            >
              <Edit size={18} />
              Edit Vehicle
            </Link>
          )}
          <Link
            to="/concierge"
            className="btn-primary flex items-center gap-2"
          >
            <MessageCircle size={18} />
            Request This Car
          </Link>
          <Link
            to="/documents"
            className="btn-secondary flex items-center gap-2"
          >
            <FileText size={18} />
            Documents
          </Link>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <InfoCard label="VIN" value={vehicle.vin} />
        <InfoCard
          label="Mileage"
          value={vehicle.current_mileage || vehicle.mileage
            ? `${(vehicle.current_mileage || vehicle.mileage).toLocaleString()} mi`
            : null}
        />
        <InfoCard label="Location" value={vehicle.storage_location || vehicle.location} />
        <InfoCard
          label="Registration Due"
          value={vehicle.registration_expires || vehicle.registration_expiry
            ? format(new Date(vehicle.registration_expires || vehicle.registration_expiry), 'MMM d, yyyy')
            : null}
        />
        <InfoCard
          label="Insurance Renewal"
          value={vehicle.insurance_expires || vehicle.insurance_expiry
            ? format(new Date(vehicle.insurance_expires || vehicle.insurance_expiry), 'MMM d, yyyy')
            : null}
        />
        <InfoCard
          label="Last Service"
          value={vehicle.last_service_date
            ? format(new Date(vehicle.last_service_date), 'MMM d, yyyy')
            : serviceRecords[0]?.service_date
              ? format(new Date(serviceRecords[0].service_date), 'MMM d, yyyy')
              : null}
        />
      </div>

      {/* Additional Details */}
      {(vehicle.interior_color || vehicle.license_plate) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {vehicle.interior_color && (
            <InfoCard label="Interior" value={vehicle.interior_color} />
          )}
          {vehicle.license_plate && (
            <InfoCard label="License Plate" value={vehicle.license_plate} />
          )}
        </div>
      )}

      {/* Notes / Special Instructions */}
      {(vehicle.notes || vehicle.special_instructions) && (
        <div className="card p-6 mb-8">
          <h3 className="section-title mb-3">Notes</h3>
          <p className="text-rdc-dark-gray">{vehicle.notes || vehicle.special_instructions}</p>
        </div>
      )}

      {/* Recent Service History */}
      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Service History</h3>
          <div className="flex items-center gap-3">
            {isOwner && (
              <Link to="/service-history/add" className="text-sm text-rdc-primary hover:underline flex items-center gap-1">
                <Plus size={14} />
                Add Record
              </Link>
            )}
            <Link to="/service-history" className="text-sm text-rdc-primary hover:underline">
              View All
            </Link>
          </div>
        </div>

        {serviceRecords.length === 0 ? (
          <div className="text-center py-8 text-rdc-taupe">
            <Wrench size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
            <p>No service records yet</p>
            {isOwner && (
              <Link to="/service-history/add" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Plus size={16} />
                Add First Record
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {serviceRecords.slice(0, 3).map((record) => (
              <div key={record.id} className="bg-rdc-cream rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-black capitalize">{record.service_type}</span>
                  <span className="text-sm text-rdc-taupe">
                    {format(new Date(record.service_date), 'MMM d, yyyy')}
                  </span>
                </div>
                {record.description && (
                  <div className="text-sm text-rdc-dark-gray">{record.description}</div>
                )}
                <div className="text-sm text-rdc-taupe">
                  {record.performed_by || record.vendor_name}
                </div>
                {record.notes && (
                  <div className="text-sm text-rdc-taupe mt-2">{record.notes}</div>
                )}
                <div className="text-sm font-semibold text-rdc-forest mt-2">
                  ${(record.cost || record.total_cost || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Documents */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Documents</h3>
          <Link to="/documents" className="text-sm text-rdc-primary hover:underline">
            View All
          </Link>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-8 text-rdc-taupe">
            <FileText size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
            <p>No documents uploaded</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.slice(0, 5).map((doc) => (
              <a
                key={doc.id}
                href={doc.document_url || doc.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-rdc-cream rounded-lg hover:bg-rdc-warm-gray/30 transition-colors"
              >
                <FileText size={20} className="text-rdc-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-black truncate">{doc.title || doc.name}</div>
                  <div className="text-xs text-rdc-taupe capitalize">{doc.document_type || doc.type}</div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
