import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getVehicles } from '../../lib/supabase'
import { Car, Plus, Search, Edit, ChevronRight } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const config = {
    ready: { bg: 'bg-rdc-forest/20', text: 'text-rdc-forest', label: 'Ready' },
    in_service: { bg: 'bg-rdc-tan/20', text: 'text-rdc-tan', label: 'In Service' },
    stored: { bg: 'bg-rdc-olive/20', text: 'text-rdc-olive', label: 'Stored' },
    in_transit: { bg: 'bg-rdc-burgundy/20', text: 'text-rdc-burgundy', label: 'In Transit' },
  }
  const c = config[status] || config.stored
  return <span className={`px-2 py-0.5 rounded text-xs font-medium ${c.bg} ${c.text}`}>{c.label}</span>
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadVehicles()
  }, [])

  const loadVehicles = async () => {
    try {
      const { data } = await getVehicles()
      setVehicles(data || [])
    } catch (err) {
      console.error('Error loading vehicles:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredVehicles = vehicles.filter(v =>
    `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase()) ||
    v.owner?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    v.vin?.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="page-title">Vehicles</h1>
          <p className="text-rdc-taupe mt-1">{vehicles.length} total vehicles</p>
        </div>
        <Link to="/admin/vehicles/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          Add Vehicle
        </Link>
      </div>

      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-rdc-taupe" />
        <input
          type="text"
          placeholder="Search by make, model, owner, or VIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <Car size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">
            {search ? 'No vehicles found' : 'No vehicles yet'}
          </h3>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[80px_2fr_1.5fr_1fr_1fr_50px] gap-4 px-5 py-3 bg-rdc-cream text-xs font-semibold text-rdc-taupe uppercase tracking-wide">
            <div></div>
            <div>Vehicle</div>
            <div>Owner</div>
            <div>Status</div>
            <div>Mileage</div>
            <div></div>
          </div>

          <div className="divide-y divide-rdc-cream">
            {filteredVehicles.map(vehicle => (
              <Link
                key={vehicle.id}
                to={`/admin/vehicles/${vehicle.id}/edit`}
                className="grid grid-cols-1 md:grid-cols-[80px_2fr_1.5fr_1fr_1fr_50px] gap-2 md:gap-4 p-4 hover:bg-rdc-cream/50 transition-colors items-center"
              >
                <div className="w-16 h-12 rounded-lg bg-rdc-cream overflow-hidden">
                  {vehicle.primary_image_url ? (
                    <img src={vehicle.primary_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={20} className="text-rdc-warm-gray" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-medium text-black">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-rdc-taupe">{vehicle.color}</div>
                </div>
                <div className="text-sm text-rdc-dark-gray">{vehicle.owner?.full_name || '—'}</div>
                <div><StatusBadge status={vehicle.status} /></div>
                <div className="text-sm text-rdc-taupe">{vehicle.mileage?.toLocaleString() || 0} mi</div>
                <div className="flex justify-end">
                  <Edit size={18} className="text-rdc-warm-gray" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
