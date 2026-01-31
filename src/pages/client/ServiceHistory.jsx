import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getServiceRecords, getVehicles } from '../../lib/supabase'
import { format } from 'date-fns'
import { Wrench, Filter, AlertCircle } from 'lucide-react'

export default function ServiceHistory() {
  const { user } = useAuth()
  const [records, setRecords] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterVehicle, setFilterVehicle] = useState('all')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [vehiclesRes, recordsRes] = await Promise.all([
        getVehicles(user.id),
        getServiceRecords()
      ])

      if (vehiclesRes.error) throw vehiclesRes.error

      const userVehicleIds = (vehiclesRes.data || []).map(v => v.id)
      const filteredRecords = (recordsRes.data || []).filter(r =>
        userVehicleIds.includes(r.vehicle_id)
      )

      setVehicles(vehiclesRes.data || [])
      setRecords(filteredRecords)
    } catch (err) {
      console.error('Error loading service records:', err)
      setError('Failed to load service records')
    } finally {
      setLoading(false)
    }
  }

  const filteredRecords = filterVehicle === 'all'
    ? records
    : records.filter(r => r.vehicle_id === filterVehicle)

  const totalCost = filteredRecords.reduce((sum, r) => sum + (r.total_cost || 0), 0)

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
          <h1 className="page-title">Service History</h1>
          <p className="text-rdc-taupe mt-1">
            Complete maintenance records for your collection
          </p>
        </div>

        {/* Filter */}
        {vehicles.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-rdc-taupe" />
            <select
              value={filterVehicle}
              onChange={(e) => setFilterVehicle(e.target.value)}
              className="input-field py-2 pr-10"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {filteredRecords.length === 0 ? (
        <div className="card p-12 text-center">
          <Wrench size={48} className="text-rdc-warm-gray mx-auto mb-4" />
          <h3 className="font-display text-lg font-semibold text-black mb-2">
            No service records
          </h3>
          <p className="text-rdc-taupe">
            Service records will appear here once they're logged.
          </p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="card overflow-hidden mb-6">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1fr_1.5fr_1fr_1fr_100px] gap-4 px-5 py-3 bg-rdc-cream text-xs font-semibold text-rdc-taupe uppercase tracking-wide">
              <div>Date</div>
              <div>Service</div>
              <div>Vendor</div>
              <div>Notes</div>
              <div className="text-right">Cost</div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-rdc-cream">
              {filteredRecords.map((record) => {
                const vehicle = record.vehicle
                return (
                  <div
                    key={record.id}
                    className="grid grid-cols-1 md:grid-cols-[1fr_1.5fr_1fr_1fr_100px] gap-2 md:gap-4 p-5 hover:bg-rdc-cream/50 transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-black">
                        {format(new Date(record.service_date), 'MMM d, yyyy')}
                      </div>
                      <div className="text-xs text-rdc-taupe">
                        {record.mileage_at_service?.toLocaleString()} mi
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-black">{record.service_type}</div>
                      <div className="text-xs text-rdc-taupe">
                        {vehicle?.year} {vehicle?.make} {vehicle?.model}
                      </div>
                    </div>
                    <div className="text-sm text-rdc-dark-gray">
                      {record.vendor_name}
                    </div>
                    <div className="text-sm text-rdc-taupe line-clamp-2">
                      {record.notes}
                    </div>
                    <div className="text-sm font-semibold text-rdc-forest md:text-right">
                      ${record.total_cost?.toLocaleString() || 0}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Total */}
          <div className="card p-5 flex justify-end">
            <div className="text-right">
              <div className="text-sm text-rdc-taupe mb-1">Total Service Costs</div>
              <div className="text-2xl font-bold text-rdc-forest">
                ${totalCost.toLocaleString()}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
