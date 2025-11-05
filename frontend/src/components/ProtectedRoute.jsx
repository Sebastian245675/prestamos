import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { usePermisos } from '../hooks/usePermisos'

/**
 * Componente para proteger rutas según permisos
 */
export default function ProtectedRoute({ children, permiso, soloPrestamista, siempreVisible }) {
  const { user } = useAuth()
  const { tienePermiso } = usePermisos()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // Si siempre es visible, permitir acceso
  if (siempreVisible) {
    return children
  }

  // Si es solo para prestamistas
  if (soloPrestamista && user.rol !== 'PRESTAMISTA') {
    return <Navigate to="/dashboard" replace />
  }

  // Si requiere un permiso específico
  if (permiso && !tienePermiso(permiso)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

