import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Bell, Lock, CreditCard, Shield, HelpCircle } from 'lucide-react'

export default function SettingsButton() {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Configuración"
      >
        <Settings size={24} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-[100]">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Configuración</h3>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              to="/configuracion/perfil"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} />
              <span>Notificaciones</span>
            </Link>
            <Link
              to="/configuracion/seguridad"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Lock size={18} />
              <span>Seguridad</span>
            </Link>
            <Link
              to="/configuracion/suscripcion"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CreditCard size={18} />
              <span>Suscripción</span>
            </Link>
            <Link
              to="/configuracion/privacidad"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Shield size={18} />
              <span>Privacidad</span>
            </Link>
            <Link
              to="/configuracion/ayuda"
              onClick={() => setIsOpen(false)}
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <HelpCircle size={18} />
              <span>Ayuda</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

