import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirigir si es un error de autenticación claro (401)
    // Para 403, solo redirigir si el mensaje indica que es un problema de autenticación
    if (error.response?.status === 401) {
      console.error('Error de autenticación (401):', error.response?.data)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      const errorMessage = error.response?.data?.message || ''
      const errorCode = error.response?.data?.code || ''
      
      // Verificar si es error de suscripción vencida
      if (errorCode === 'SUBSCRIPTION_EXPIRED' || 
          errorMessage.includes('Suscripción vencida') || 
          errorMessage.includes('suscripción') ||
          errorMessage.includes('renueva tu suscripción')) {
        console.error('Suscripción vencida (403):', error.response?.data)
        
        // No cerrar sesión, pero redirigir a perfil/suscripción
        if (window.location.pathname !== '/perfil' && !window.location.pathname.includes('/suscripcion')) {
          // Guardar el mensaje de error para mostrarlo
          sessionStorage.setItem('subscriptionError', errorMessage)
          window.location.href = '/perfil?tab=suscripcion'
        }
        return Promise.reject(error)
      }
      
      // Verificar si es error de autenticación
      const isAuthError = errorMessage.includes('autenticado') || 
                          errorMessage.includes('autenticación') ||
                          errorMessage.includes('Token') ||
                          errorMessage.includes('token')
      
      if (isAuthError) {
        console.error('Error de autenticación (403):', error.response?.data)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } else {
        console.error('Error 403 (probablemente de autorización):', error.response?.data)
        // No redirigir, solo mostrar el error
      }
    }
    return Promise.reject(error)
  }
)

export default api

