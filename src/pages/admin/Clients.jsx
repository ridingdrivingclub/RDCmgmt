import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProfiles, getVehicles } from '../../lib/supabase'
import { format } from 'date-fns'
import { Users, Search, ChevronRight, Mail, Car } from 'lucide-react'

export default function AdminClients() {
  const [clients, setClients] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [profilesRes, vehiclesRes] = await Promise.all([
        getAllProfiles(),
        getVehicles()
      ])

      const clientProfiles = (profilesRes.data || []).filter(p => p.role === 'client')
      setClients(clientProfiles)
      setVehicles(vehiclesRes.data || [])
    } catch (err) {
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    client.email?.toLowerCase().includes(search.toLowerCase())
  )

  const getVehicleCount = (clientId) =>
    vehicles.filter(v => v.owner_id === clientId).length

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
          <h1 className="page-title">Clients</h1>
          <p className="text-rdc-taupe mt-1">{clients.length} total clients</p>
        </div>
        <Link to="/admin/invitations" className="btn-primary">
          <Mail size={18} className="mr-2" />
          Invite Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-rdc-taupe" />
        <input
          type="text"
          placeholder="Search clients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {filteredClients.length === 0 ? (
        <div className="card p-12 text-center">
          <Users size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">
            {search ? 'No clients found' : 'No clients yet'}
          </h3>
          <p className="text-rdc-taupe">
            {search ? 'Try a different search term' : 'Invite your first client to get started'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_50px] gap-4 px-5 py-3 bg-rdc-cream text-xs font-semibold text-rdc-taupe uppercase tracking-wide">
            <div>Name</div>
            <div>Email</div>
            <div>Vehicles</div>
            <div>Member Since</div>
            <div></div>
          </div>

          <div className="divide-y divide-rdc-cream">
            {filteredClients.map(client => (
              <Link
                key={client.id}
                to={`/admin/clients/${client.id}`}
                className="grid grid-cols-1 md:grid-cols-[2fr_2fr_1fr_1fr_50px] gap-2 md:gap-4 p-5 hover:bg-rdc-cream/50 transition-colors items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center font-semibold text-rdc-primary">
                    {client.full_name?.charAt(0) || '?'}
                  </div>
                  <span className="font-medium text-black">{client.full_name || 'Unnamed'}</span>
                </div>
                <div className="text-sm text-rdc-dark-gray">{client.email}</div>
                <div className="flex items-center gap-1 text-sm text-rdc-taupe">
                  <Car size={16} />
                  {getVehicleCount(client.id)} vehicles
                </div>
                <div className="text-sm text-rdc-taupe">
                  {format(new Date(client.member_since || client.created_at), 'MMM yyyy')}
                </div>
                <div className="flex justify-end">
                  <ChevronRight size={20} className="text-rdc-warm-gray" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
