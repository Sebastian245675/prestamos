import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (user) {
      fetchNotifications()
      // Simular nuevas notificaciones cada cierto tiempo solo si hay usuario autenticado
      const interval = setInterval(() => {
        if (user) {
          fetchNotifications()
        }
      }, 30000) // Cada 30 segundos

      return () => clearInterval(interval)
    } else {
      // Si no hay usuario, limpiar notificaciones
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const fetchNotifications = async () => {
    if (!user) return
    
    try {
      const response = await api.get('/notificaciones')
      const notificaciones = response.data || []
      
      // Convertir fecha de string a Date si es necesario
      const notificacionesFormateadas = notificaciones.map(n => ({
        ...n,
        fecha: n.fecha || new Date().toISOString()
      }))
      
      setNotifications(notificacionesFormateadas)
      
      // Calcular no leídas
      const unread = notificacionesFormateadas.filter(n => !n.read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
      // En caso de error, mantener las notificaciones existentes
    }
  }

  const markAsRead = async (id) => {
    // Optimistic update
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(Math.max(0, unreadCount - 1))
    
    // Actualizar en el backend
    try {
      await api.put(`/notificaciones/${id}/read`)
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
      // Revertir si falla
      fetchNotifications()
    }
  }

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
    
    // Actualizar en el backend
    try {
      await api.put('/notificaciones/read-all')
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
      // Revertir si falla
      fetchNotifications()
    }
  }

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id))
    const deleted = notifications.find(n => n.id === id)
    if (deleted && !deleted.read) {
      setUnreadCount(Math.max(0, unreadCount - 1))
    }
  }

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      ...notification,
      fecha: new Date().toISOString(),
      read: false
    }
    setNotifications([newNotification, ...notifications])
    setUnreadCount(unreadCount + 1)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      addNotification,
      fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

