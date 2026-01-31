import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import {
  LayoutDashboard,
  Users,
  Car,
  Wrench,
  Calendar,
  MessageCircle,
  Mail,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/vehicles', icon: Car, label: 'Vehicles' },
  { to: '/admin/service-records', icon: Wrench, label: 'Service Records' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/admin/invitations', icon: Mail, label: 'Invitations' },
]

export default function AdminLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavItem = ({ to, icon: Icon, label, exact }) => (
    <NavLink
      to={to}
      end={exact}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-3.5 text-sm transition-all duration-200 border-l-[3px] ${
          isActive
            ? 'bg-rdc-forest/10 text-rdc-forest border-rdc-forest font-medium'
            : 'text-rdc-dark-gray border-transparent hover:bg-rdc-cream'
        }`
      }
    >
      <Icon size={20} />
      <span>{label}</span>
    </NavLink>
  )

  return (
    <div className="flex min-h-screen bg-rdc-cream">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-white border-r border-rdc-warm-gray/40
          flex flex-col transform transition-transform duration-300
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-5 border-b border-rdc-taupe/20">
          <Logo />
          <div className="mt-3 text-center">
            <span className="inline-block px-3 py-1 text-xs font-medium text-rdc-forest bg-rdc-forest/10 rounded-full">
              Admin Dashboard
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-5 border-t border-rdc-warm-gray/40">
          {/* Client Portal Link */}
          <NavLink
            to="/garage"
            className="flex items-center gap-3 px-3 py-2 mb-3 text-sm text-rdc-primary bg-rdc-primary/10 rounded-lg hover:bg-rdc-primary/20 transition-colors"
          >
            <Home size={18} />
            <span className="font-medium">Client Portal</span>
          </NavLink>

          {/* Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rdc-forest/20 flex items-center justify-center font-semibold text-rdc-forest">
              {profile?.full_name?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black truncate">
                {profile?.full_name || 'Admin'}
              </div>
              <div className="text-xs text-rdc-taupe">Administrator</div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-2 py-2 text-sm text-rdc-taupe hover:text-rdc-primary transition-colors w-full"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
