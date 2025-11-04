import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

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
    const token = localStorage.getItem('token')
    if (token) {
      // Verificar token y obtener usuario
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // Aquí podrías hacer una llamada para obtener el usuario
      // Por ahora, simplemente establecemos que hay un token
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      // Modo desarrollo: acepta cualquier credencial
      // En producción, esto debe conectarse al backend
      const mockUser = {
        id: 1,
        email: email || 'admin@prestacol.com',
        nombreCompleto: email ? email.split('@')[0] : 'Usuario Demo',
        telefono: '3001234567',
        rol: 'PRESTAMISTA',
        suscripcionActiva: true
      }
      const mockToken = 'dev-token-' + Date.now()
      
      localStorage.setItem('token', mockToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      setUser(mockUser)
      
      // También intentar el backend real por si está disponible
      try {
        const response = await axios.post('/api/auth/login', { email, password })
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          setUser(response.data.user)
        }
      } catch (e) {
        // Si el backend no está disponible, usar mock
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' }
    }
  }

  const register = async (userData) => {
    try {
      // Modo desarrollo: acepta cualquier registro
      const mockUser = {
        id: Date.now(),
        email: userData.email || 'nuevo@prestacol.com',
        nombreCompleto: userData.nombreCompleto || 'Nuevo Usuario',
        telefono: userData.telefono || '3001234567',
        rol: 'PRESTAMISTA',
        suscripcionActiva: true
      }
      const mockToken = 'dev-token-' + Date.now()
      
      localStorage.setItem('token', mockToken)
      axios.defaults.headers.common['Authorization'] = `Bearer ${mockToken}`
      setUser(mockUser)
      
      // También intentar el backend real por si está disponible
      try {
        const response = await axios.post('/api/auth/register', userData)
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`
          setUser(response.data.user)
        }
      } catch (e) {
        // Si el backend no está disponible, usar mock
      }
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Error al registrarse' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

