import { useAuth } from '../context/AuthContext'

/**
 * Hook para verificar permisos del usuario actual
 */
export const usePermisos = () => {
  const { user } = useAuth()
  
  /**
   * Verifica si el usuario tiene un permiso específico
   * Los prestamistas tienen todos los permisos por defecto
   */
  const tienePermiso = (permiso) => {
    if (!user) return false
    
    // Los prestamistas tienen todos los permisos
    if (user.rol === 'PRESTAMISTA') {
      return true
    }
    
    // Para cobradores, verificar permisos específicos
    if (user.rol === 'COBRADOR' && user.permisos) {
      return user.permisos[permiso] === true
    }
    
    return false
  }
  
  return { tienePermiso }
}

