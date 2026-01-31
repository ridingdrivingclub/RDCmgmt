import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Logo from '../components/Logo'
import {
  Car,
  Wrench,
  Calendar,
  MessageCircle,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Shield
} from 'lucide-react'

const navItems = [
  { to: '/garage', icon: Car, label: 'My Garage' },
  { to: '/service-history', icon: Wrench, label: 'Service History' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/concierge', icon: MessageCircle, label: 'Concierge' },
  { to: '/documents', icon: FileText, label: 'Documents' },
]

export default function ClientLayout() {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) =>
        `flex items-center gap-3 px-5 py-3.5 text-sm transition-all duration-200 border-l-[3px] ${
          isActive
            ? 'bg-rdc-primary/10 text-rdc-primary border-rdc-primary font-medium'
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* User Section */}
        <div className="p-5 border-t border-rdc-warm-gray/40">
          {/* Admin Link */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className="flex items-center gap-3 px-3 py-2 mb-3 text-sm text-rdc-forest bg-rdc-forest/10 rounded-lg hover:bg-rdc-forest/20 transition-colors"
            >
              <Shield size={18} />
              <span className="font-medium">Admin Dashboard</span>
            </NavLink>
          )}

          {/* Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-rdc-cream flex items-center justify-center font-semibold text-rdc-primary">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-black truncate">
                {profile?.full_name || 'User'}
              </div>
              <div className="text-xs text-rdc-taupe">
                Member since {new Date(profile?.member_since || profile?.created_at).getFullYear()}
              </div>
            </div>
          </div>

          {/* Settings & Logout */}
          <div className="space-y-1">
            <NavLink
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 px-2 py-2 text-sm text-rdc-taupe hover:text-rdc-dark-gray transition-colors"
            >
              <Settings size={16} />
              <span>Settings</span>
            </NavLink>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-2 text-sm text-rdc-taupe hover:text-rdc-primary transition-colors w-full"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
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
