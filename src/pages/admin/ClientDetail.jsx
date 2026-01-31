import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getProfile, getVehicles, getServiceRecords, getDocuments } from '../../lib/supabase'
import { format } from 'date-fns'
import { ArrowLeft, User, Car, Wrench, FileText, Mail, Phone, Calendar } from 'lucide-react'

export default function AdminClientDetail() {
  const { clientId } = useParams()
  const [client, setClient] = useState(null)
  const [vehicles, setVehicles] = useState([])
  const [serviceRecords, setServiceRecords] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [clientId])

  const loadData = async () => {
    try {
      const [profileRes, vehiclesRes, docsRes] = await Promise.all([
        getProfile(clientId),
        getVehicles(clientId),
        getDocuments(clientId)
      ])

      setClient(profileRes.data)
      setVehicles(vehiclesRes.data || [])
      setDocuments(docsRes.data || [])

      // Get service records for client's vehicles
      const vehicleIds = (vehiclesRes.data || []).map(v => v.id)
      const allServices = await getServiceRecords()
      const clientServices = (allServices.data || []).filter(s => vehicleIds.includes(s.vehicle_id))
      setServiceRecords(clientServices)
    } catch (err) {
      console.error('Error loading client:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalServiceCost = serviceRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-forest border-t-transparent" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="card p-12 text-center">
        <User size={48} className="text-rdc-warm-gray mx-auto mb-4" />
        <h3 className="font-display text-lg font-semibold text-black mb-2">Client not found</h3>
        <Link to="/admin/clients" className="btn-primary mt-4">Back to Clients</Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-rdc-taupe hover:text-rdc-primary mb-6">
        <ArrowLeft size={20} />
        Back to Clients
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-rdc-primary/10 flex items-center justify-center font-bold text-2xl text-rdc-primary">
            {client.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <h1 className="page-title">{client.full_name || 'Unnamed Client'}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-rdc-taupe">
              <span className="flex items-center gap-1">
                <Mail size={16} />
                {client.email}
              </span>
              {client.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={16} />
                  {client.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={16} />
                Member since {format(new Date(client.member_since || client.created_at), 'MMMM yyyy')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rdc-primary/10 flex items-center justify-center">
              <Car size={20} className="text-rdc-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{vehicles.length}</div>
              <div className="text-sm text-rdc-taupe">Vehicles</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rdc-olive/10 flex items-center justify-center">
              <Wrench size={20} className="text-rdc-olive" />
            </div>
            <div>
              <div className="text-2xl font-bold text-black">{serviceRecords.length}</div>
              <div className="text-sm text-rdc-taupe">Service Records</div>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rdc-forest/10 flex items-center justify-center">
              <FileText size={20} className="text-rdc-forest" />
            </div>
            <div>
              <div className="text-2xl font-bold text-rdc-forest">${totalServiceCost.toLocaleString()}</div>
              <div className="text-sm text-rdc-taupe">Total Service Costs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Vehicles</h2>
          <Link to={`/admin/vehicles/new?client=${clientId}`} className="btn-primary text-sm py-2">
            Add Vehicle
          </Link>
        </div>

        {vehicles.length === 0 ? (
          <div className="text-center py-8 text-rdc-taupe">
            <Car size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
            <p>No vehicles yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map(vehicle => (
              <Link
                key={vehicle.id}
                to={`/admin/vehicles/${vehicle.id}/edit`}
                className="flex items-center gap-4 p-4 bg-rdc-cream rounded-lg hover:bg-rdc-warm-gray/30 transition-colors"
              >
                <div className="w-16 h-16 rounded-lg bg-white overflow-hidden flex-shrink-0">
                  {vehicle.primary_image_url ? (
                    <img src={vehicle.primary_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={24} className="text-rdc-warm-gray" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-black">{vehicle.year} {vehicle.make} {vehicle.model}</div>
                  <div className="text-sm text-rdc-taupe">{vehicle.color}</div>
                  <div className="text-sm text-rdc-taupe">{vehicle.mileage?.toLocaleString()} mi</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Service */}
      <div className="card p-6">
        <h2 className="section-title mb-4">Recent Service History</h2>

        {serviceRecords.length === 0 ? (
          <div className="text-center py-8 text-rdc-taupe">
            <Wrench size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
            <p>No service records yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceRecords.slice(0, 5).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-rdc-cream rounded-lg">
                <div>
                  <div className="font-medium text-black">{record.service_type}</div>
                  <div className="text-sm text-rdc-taupe">
                    {record.vehicle?.year} {record.vehicle?.make} {record.vehicle?.model}
                    {' • '}{format(new Date(record.service_date), 'MMM d, yyyy')}
                  </div>
                </div>
                <div className="font-semibold text-rdc-forest">${record.total_cost?.toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
