import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { getAppointments, getVehicles } from '../../lib/supabase'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { Calendar, Clock, MapPin, AlertCircle, Bell } from 'lucide-react'

const StatusBadge = ({ status }) => {
  const config = {
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
    confirmed: { bg: 'bg-green-100', text: 'text-green-700' },
    completed: { bg: 'bg-gray-100', text: 'text-gray-600' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-600' },
  }
  const c = config[status] || config.scheduled
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${c.bg} ${c.text}`}>
      {status}
    </span>
  )
}

const AppointmentCard = ({ appointment }) => {
  const date = new Date(appointment.scheduled_date)
  const isUpcoming = !isPast(date) || isToday(date)
  const daysUntil = differenceInDays(date, new Date())

  return (
    <div className="card p-5 flex gap-4">
      <div className={`min-w-[60px] text-center p-3 rounded-lg ${isUpcoming ? 'bg-rdc-primary/10' : 'bg-rdc-cream'}`}>
        <div className={`text-2xl font-bold ${isUpcoming ? 'text-rdc-primary' : 'text-rdc-dark-gray'}`}>
          {format(date, 'd')}
        </div>
        <div className="text-xs text-rdc-taupe uppercase">
          {format(date, 'MMM')}
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-black">{appointment.title}</h3>
          <StatusBadge status={appointment.status} />
        </div>
        <div className="text-sm text-rdc-dark-gray mb-2">
          {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-rdc-taupe">
          {appointment.scheduled_time && (
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {appointment.scheduled_time.substring(0, 5)}
            </span>
          )}
          {appointment.vendor_name && (
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {appointment.vendor_name}
            </span>
          )}
        </div>
        {appointment.notes && (
          <div className="text-sm text-rdc-taupe mt-2 italic">{appointment.notes}</div>
        )}
      </div>
    </div>
  )
}

export default function Appointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [appointmentsRes, vehiclesRes] = await Promise.all([
        getAppointments(user.id),
        getVehicles(user.id)
      ])

      if (appointmentsRes.error) throw appointmentsRes.error

      setAppointments(appointmentsRes.data || [])
      setVehicles(vehiclesRes.data || [])
    } catch (err) {
      console.error('Error loading appointments:', err)
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  const upcomingAppointments = appointments
    .filter(a => !isPast(new Date(a.scheduled_date)) || isToday(new Date(a.scheduled_date)))
    .filter(a => a.status !== 'cancelled' && a.status !== 'completed')

  const pastAppointments = appointments
    .filter(a => isPast(new Date(a.scheduled_date)) && !isToday(new Date(a.scheduled_date)))
    .concat(appointments.filter(a => a.status === 'completed'))

  // Calculate upcoming reminders from vehicles
  const reminders = vehicles
    .map(v => {
      const items = []
      if (v.registration_expiry) {
        const days = differenceInDays(new Date(v.registration_expiry), new Date())
        if (days <= 180 && days > 0) {
          items.push({
            vehicle: v,
            type: 'Registration',
            date: v.registration_expiry,
            daysUntil: days
          })
        }
      }
      if (v.insurance_expiry) {
        const days = differenceInDays(new Date(v.insurance_expiry), new Date())
        if (days <= 180 && days > 0) {
          items.push({
            vehicle: v,
            type: 'Insurance',
            date: v.insurance_expiry,
            daysUntil: days
          })
        }
      }
      return items
    })
    .flat()
    .sort((a, b) => a.daysUntil - b.daysUntil)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-rdc-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Appointments & Reminders</h1>
        <p className="text-rdc-taupe mt-1">
          Upcoming services, registrations, and renewals
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-rdc-taupe uppercase tracking-wide mb-4">
            Upcoming
          </h2>

          {upcomingAppointments.length === 0 ? (
            <div className="card p-8 text-center">
              <Calendar size={40} className="text-rdc-warm-gray mx-auto mb-3" />
              <p className="text-rdc-taupe">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((apt) => (
                <AppointmentCard key={apt.id} appointment={apt} />
              ))}
            </div>
          )}

          {pastAppointments.length > 0 && (
            <>
              <h2 className="text-sm font-semibold text-rdc-taupe uppercase tracking-wide mt-8 mb-4">
                Past
              </h2>
              <div className="space-y-4 opacity-75">
                {pastAppointments.slice(0, 5).map((apt) => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Reminders Sidebar */}
        <div>
          <h2 className="text-sm font-semibold text-rdc-taupe uppercase tracking-wide mb-4">
            Quick Reminders
          </h2>

          <div className="card p-5">
            {reminders.length === 0 ? (
              <div className="text-center py-4 text-rdc-taupe">
                <Bell size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
                <p className="text-sm">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-3 border-b border-rdc-cream last:border-0"
                  >
                    <div>
                      <div className="text-sm font-medium text-black">
                        {reminder.vehicle.make} {reminder.vehicle.model}
                      </div>
                      <div className="text-xs text-rdc-taupe">{reminder.type}</div>
                    </div>
                    <div className={`text-sm font-semibold ${reminder.daysUntil < 30 ? 'text-rdc-primary' : 'text-rdc-forest'}`}>
                      {reminder.daysUntil} days
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
