import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { getVehicles } from '../../lib/supabase'
import { Car, ChevronRight, AlertCircle } from 'lucide-react'

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    ready: { bg: 'bg-rdc-forest/20', text: 'text-rdc-forest', label: 'Ready' },
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

// Vehicle card component
const VehicleCard = ({ vehicle }) => (
  <Link
    to={`/garage/${vehicle.id}`}
    className="card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
  >
    <div className="h-48 bg-rdc-cream overflow-hidden relative">
      {vehicle.primary_image_url ? (
        <img
          src={vehicle.primary_image_url}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Car size={48} className="text-rdc-warm-gray" />
        </div>
      )}
      <div className="absolute top-3 right-3">
        <StatusBadge status={vehicle.status} />
      </div>
    </div>
    <div className="p-4">
      <div className="text-xs text-rdc-taupe mb-1">{vehicle.year}</div>
      <h3 className="font-display text-lg font-semibold text-black mb-1">
        {vehicle.make} {vehicle.model}
      </h3>
      <div className="text-sm text-rdc-dark-gray">{vehicle.color}</div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-rdc-cream">
        <span className="text-sm text-rdc-taupe">
          {vehicle.mileage?.toLocaleString() || 0} mi
        </span>
        <ChevronRight size={18} className="text-rdc-primary" />
      </div>
    </div>
  </Link>
)

export default function Garage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadVehicles()
  }, [user])

  const loadVehicles = async () => {
    try {
      const { data, error } = await getVehicles(user.id)
      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Error loading vehicles:', err)
      setError('Failed to load vehicles')
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

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="page-title">My Garage</h1>
          <p className="text-rdc-taupe mt-1">
            {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {vehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <Car size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">
            No vehicles yet
          </h3>
          <p className="text-rdc-taupe">
            Your vehicles will appear here once they're added to your account.
            Contact your concierge to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      )}
    </div>
  )
}
