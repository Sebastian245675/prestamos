import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
          <User className="text-white" size={18} />
        </div>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white rounded-md shadow-xl border z-[100] overflow-hidden">
          {/* User Info - Línea superior */}
          <div className="px-4 pt-3 pb-2 bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user?.nombreCompleto || 'Usuario'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{user?.email || 'email@ejemplo.com'}</p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>

          {/* Menu Items */}
          <div className="py-1.5">
            <Link
              to="/perfil"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700"
            >
              <div className="flex items-center gap-2">
                <User size={15} className="text-gray-500" />
                <span>Mi Perfil</span>
              </div>
            </Link>
            <Link
              to="/configuracion"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-700"
            >
              <div className="flex items-center gap-2">
                <Settings size={15} className="text-gray-500" />
                <span>Configuración</span>
              </div>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
          >
            <div className="flex items-center gap-2">
              <LogOut size={15} />
              <span>Cerrar Sesión</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

