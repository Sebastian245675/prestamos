import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermisos } from '../hooks/usePermisos'
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  BarChart3, 
  Users,
  UserCircle,
  Wallet,
  HelpCircle,
  Gift,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { useState, useMemo } from 'react'
import NotificationBell from './NotificationBell'
import SettingsButton from './SettingsButton'
import UserMenu from './UserMenu'

export default function Layout() {
  const { user, logout } = useAuth()
  const { tienePermiso } = usePermisos()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filtrar navegación según permisos
  const navigation = useMemo(() => {
    const allItems = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permiso: 'verPrestamos' },
      { name: 'Préstamos', href: '/prestamos', icon: FileText, permiso: 'verPrestamos' },
      { name: 'Clientes', href: '/clientes', icon: UserCircle, permiso: 'gestionarClientes' },
      { name: 'Calendario', href: '/calendario', icon: Calendar, permiso: 'verCalendario' },
      { name: 'Movimientos', href: '/movimientos', icon: Wallet, permiso: 'verPrestamos', soloConPermisoMovimientos: true },
      { name: 'Reportes', href: '/reportes', icon: BarChart3, permiso: 'verReportes' },
      { name: 'Cobradores', href: '/cobradores', icon: Users, permiso: null, soloPrestamista: true },
      { name: 'Referidos', href: '/referidos', icon: Gift, permiso: null, soloPrestamista: true },
      { name: 'Soporte', href: '/soporte', icon: HelpCircle, permiso: null, siempreVisible: true },
    ]

    return allItems.filter(item => {
      // Si siempre es visible (como Soporte), mostrarlo para todos
      if (item.siempreVisible) {
        return true
      }
      
      // Si es solo para prestamistas
      if (item.soloPrestamista) {
        return user?.rol === 'PRESTAMISTA'
      }
      
      // Para Movimientos, mostrar para prestamistas, pero no para cobradores
      if (item.soloConPermisoMovimientos) {
        // Los prestamistas siempre pueden ver movimientos
        if (user?.rol === 'PRESTAMISTA') {
          return true
        }
        // Los cobradores no pueden ver movimientos (a menos que se agregue un permiso específico)
        return false
      }
      
      // Si tiene permiso específico, verificar
      if (item.permiso) {
        return tienePermiso(item.permiso)
      }
      
      // Por defecto, no mostrar
      return false
    })
  }, [user, tienePermiso])

  const isActive = (path) => location.pathname === path

  return (

    <div className="min-h-screen bg-gray-50" style={{ position: 'relative' }}>
      <div className="flex">
        {/* Sidebar Fijo */}
        <aside className={`
          fixed inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-primary-600">PrestaCol</h1>
              <p className="text-sm text-gray-500 mt-1">Gestión de Préstamos</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>

            {/* User info - Logout moved to header */}
            <div className="p-4 border-t border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.nombreCompleto}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          {/* Barra superior con iconos - Parte del contenido normal */}
          <div className="px-4 py-3 lg:px-8">
            <div className="flex items-center justify-between">
              {/* Mobile: Logo y menú */}
              <div className="lg:hidden flex items-center space-x-3">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-md text-gray-700 hover:bg-gray-100 touch-manipulation"
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                <h1 className="text-xl font-bold text-primary-600">PrestaCol</h1>
              </div>
              
              {/* Desktop: Solo iconos a la derecha */}
              <div className="hidden lg:flex items-center justify-end space-x-2 w-full">
                <NotificationBell />
                <SettingsButton />
                <UserMenu />
              </div>
              
              {/* Mobile: Iconos a la derecha */}
              <div className="lg:hidden flex items-center space-x-2">
                <NotificationBell />
                <SettingsButton />
                <UserMenu />
              </div>
            </div>
          </div>
          
          {/* Contenido de la página */}
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}

