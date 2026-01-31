import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllProfiles, getVehicles, getAppointments, getConversations } from '../../lib/supabase'
import { format, isToday, isTomorrow, isPast, differenceInDays } from 'date-fns'
import { Users, Car, Calendar, MessageCircle, ChevronRight, AlertCircle, Clock } from 'lucide-react'

const StatCard = ({ icon: Icon, label, value, to, color = 'rdc-primary' }) => (
  <Link to={to} className="card p-6 hover:shadow-md transition-shadow group">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center`}>
        <Icon size={24} className={`text-${color}`} />
      </div>
      <ChevronRight size={20} className="text-rdc-warm-gray group-hover:text-rdc-primary transition-colors" />
    </div>
    <div className="text-3xl font-bold text-black">{value}</div>
    <div className="text-sm text-rdc-taupe">{label}</div>
  </Link>
)

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clients: 0,
    vehicles: 0,
    upcomingAppointments: 0,
    unreadMessages: 0
  })
  const [recentAppointments, setRecentAppointments] = useState([])
  const [recentConversations, setRecentConversations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [profilesRes, vehiclesRes, appointmentsRes, conversationsRes] = await Promise.all([
        getAllProfiles(),
        getVehicles(),
        getAppointments(),
        getConversations()
      ])

      const clients = (profilesRes.data || []).filter(p => p.role === 'client')
      const vehicles = vehiclesRes.data || []
      const appointments = appointmentsRes.data || []
      const conversations = conversationsRes.data || []

      const upcomingAppointments = appointments.filter(a =>
        !isPast(new Date(a.scheduled_date)) && a.status !== 'completed' && a.status !== 'cancelled'
      )

      const unreadMessages = conversations.reduce((count, conv) => {
        const unread = (conv.messages || []).filter(m => !m.is_read && m.sender_type === 'client').length
        return count + unread
      }, 0)

      setStats({
        clients: clients.length,
        vehicles: vehicles.length,
        upcomingAppointments: upcomingAppointments.length,
        unreadMessages
      })

      setRecentAppointments(upcomingAppointments.slice(0, 5))
      setRecentConversations(conversations.slice(0, 5))
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title">Dashboard</h1>
        <p className="text-rdc-taupe mt-1">
          Overview of your Digital Garage
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Clients"
          value={stats.clients}
          to="/admin/clients"
          color="rdc-forest"
        />
        <StatCard
          icon={Car}
          label="Vehicles"
          value={stats.vehicles}
          to="/admin/vehicles"
          color="rdc-primary"
        />
        <StatCard
          icon={Calendar}
          label="Upcoming Appointments"
          value={stats.upcomingAppointments}
          to="/admin/appointments"
          color="rdc-olive"
        />
        <StatCard
          icon={MessageCircle}
          label="Unread Messages"
          value={stats.unreadMessages}
          to="/admin/messages"
          color="rdc-burgundy"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Upcoming Appointments</h2>
            <Link to="/admin/appointments" className="text-sm text-rdc-primary hover:underline">
              View All
            </Link>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="text-center py-8 text-rdc-taupe">
              <Calendar size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAppointments.map(apt => {
                const date = new Date(apt.scheduled_date)
                const isNear = isToday(date) || isTomorrow(date)

                return (
                  <div key={apt.id} className="flex items-center gap-4 p-3 bg-rdc-cream rounded-lg">
                    <div className={`min-w-[50px] text-center py-2 px-3 rounded-lg ${isNear ? 'bg-rdc-primary/20' : 'bg-white'}`}>
                      <div className={`text-lg font-bold ${isNear ? 'text-rdc-primary' : 'text-rdc-dark-gray'}`}>
                        {format(date, 'd')}
                      </div>
                      <div className="text-xs text-rdc-taupe uppercase">{format(date, 'MMM')}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black truncate">{apt.title}</div>
                      <div className="text-sm text-rdc-taupe">
                        {apt.vehicle?.year} {apt.vehicle?.make} {apt.vehicle?.model}
                        {apt.owner?.full_name && ` • ${apt.owner.full_name}`}
                      </div>
                    </div>
                    {apt.scheduled_time && (
                      <div className="flex items-center gap-1 text-sm text-rdc-taupe">
                        <Clock size={14} />
                        {apt.scheduled_time.substring(0, 5)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Conversations */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Messages</h2>
            <Link to="/admin/messages" className="text-sm text-rdc-primary hover:underline">
              View All
            </Link>
          </div>

          {recentConversations.length === 0 ? (
            <div className="text-center py-8 text-rdc-taupe">
              <MessageCircle size={32} className="mx-auto mb-2 text-rdc-warm-gray" />
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentConversations.map(conv => {
                const lastMessage = conv.messages?.[conv.messages.length - 1]
                const unreadCount = (conv.messages || []).filter(m => !m.is_read && m.sender_type === 'client').length

                return (
                  <Link
                    key={conv.id}
                    to={`/admin/messages?conversation=${conv.id}`}
                    className="flex items-center gap-4 p-3 bg-rdc-cream rounded-lg hover:bg-rdc-warm-gray/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-rdc-primary/10 flex items-center justify-center font-semibold text-rdc-primary">
                      {conv.client?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-black truncate">
                        {conv.client?.full_name || 'Unknown Client'}
                      </div>
                      {lastMessage && (
                        <div className="text-sm text-rdc-taupe truncate">
                          {lastMessage.content}
                        </div>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <span className="min-w-[24px] h-6 px-2 bg-rdc-primary text-white text-xs font-semibold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
