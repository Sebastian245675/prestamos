import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sesión activa desde localStorage
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          // Asegurar que permisos esté presente
          const userToSet = {
            ...userData,
            permisos: userData.permisos || {}
          }
          setUser(userToSet)
          
          // Verificar si el token sigue siendo válido
          // El backend validará el token automáticamente en cada petición
        } catch (e) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    } catch (error) {
      console.error('Error checking session:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      })

      if (response.data && response.data.token) {
        const { token, user: userData } = response.data
        
        // Guardar token y usuario
        localStorage.setItem('token', token)
        const userToStore = {
          id: userData.id,
          email: userData.email,
          nombreCompleto: userData.nombreCompleto,
          telefono: userData.telefono,
          rol: userData.rol,
          suscripcionActiva: userData.suscripcionActiva,
          permisos: userData.permisos || {}
        }
        localStorage.setItem('user', JSON.stringify(userToStore))
        setUser(userToStore)
        
        return { success: true }
      }

      return { success: false, error: 'Error al iniciar sesión' }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al iniciar sesión'
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', {
        email: userData.email,
        password: userData.password,
        nombreCompleto: userData.nombreCompleto,
        telefono: userData.telefono,
        tipoSuscripcion: userData.tipoSuscripcion || 'MENSUAL',
        codigoReferido: userData.codigoReferido || null
      })

      if (response.data && response.data.token) {
        const { token, user: registeredUser } = response.data
        
        // Guardar token y usuario
        localStorage.setItem('token', token)
        const userToStore = {
          id: registeredUser.id,
          email: registeredUser.email,
          nombreCompleto: registeredUser.nombreCompleto,
          telefono: registeredUser.telefono,
          rol: registeredUser.rol,
          suscripcionActiva: registeredUser.suscripcionActiva,
          permisos: registeredUser.permisos || {}
        }
        localStorage.setItem('user', JSON.stringify(userToStore))
        setUser(userToStore)
        
        return { success: true }
      }

      return { success: false, error: 'Error al registrarse' }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error al registrarse'
      return { success: false, error: message }
    }
  }

  const logout = async () => {
    try {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

