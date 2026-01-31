import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'

// Auth Pages
import Login from './pages/auth/Login'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

// Client Portal
import ClientLayout from './layouts/ClientLayout'
import Garage from './pages/client/Garage'
import VehicleDetail from './pages/client/VehicleDetail'
import ServiceHistory from './pages/client/ServiceHistory'
import Appointments from './pages/client/Appointments'
import Concierge from './pages/client/Concierge'
import Documents from './pages/client/Documents'
import Settings from './pages/client/Settings'

// Admin Dashboard
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminClients from './pages/admin/Clients'
import AdminClientDetail from './pages/admin/ClientDetail'
import AdminVehicles from './pages/admin/Vehicles'
import AdminVehicleForm from './pages/admin/VehicleForm'
import AdminServiceRecords from './pages/admin/ServiceRecords'
import AdminAppointments from './pages/admin/Appointments'
import AdminMessages from './pages/admin/Messages'
import AdminInvitations from './pages/admin/Invitations'

// Loading Spinner
const LoadingScreen = () => (
  <div className="min-h-screen bg-rdc-cream flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-rdc-primary border-t-transparent mx-auto mb-4"></div>
      <p className="text-rdc-taupe">Loading...</p>
    </div>
  </div>
)

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requireAdmin && profile?.role !== 'admin') {
    return <Navigate to="/garage" replace />
  }

  return children
}

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (user) {
    // Redirect based on role
    if (profile?.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/garage" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/signup/:token" element={<PublicRoute><SignUp /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Client Portal Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/garage" replace />} />
        <Route path="garage" element={<Garage />} />
        <Route path="garage/:vehicleId" element={<VehicleDetail />} />
        <Route path="service-history" element={<ServiceHistory />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="concierge" element={<Concierge />} />
        <Route path="documents" element={<Documents />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="clients" element={<AdminClients />} />
        <Route path="clients/:clientId" element={<AdminClientDetail />} />
        <Route path="vehicles" element={<AdminVehicles />} />
        <Route path="vehicles/new" element={<AdminVehicleForm />} />
        <Route path="vehicles/:vehicleId/edit" element={<AdminVehicleForm />} />
        <Route path="service-records" element={<AdminServiceRecords />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="invitations" element={<AdminInvitations />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/garage" replace />} />
    </Routes>
  )
}

export default App
