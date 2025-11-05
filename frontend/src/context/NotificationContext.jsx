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
      // Mock notifications
      const mockNotifications = [
        {
          id: 1,
          type: 'warning',
          title: 'Préstamo Vencido',
          message: 'El préstamo de Juan Pérez está vencido',
          fecha: new Date().toISOString(),
          read: false,
          link: '/prestamos/1'
        },
        {
          id: 2,
          type: 'info',
          title: 'Recordatorio de Cobro',
          message: 'Tienes 3 cobros programados para hoy',
          fecha: new Date(Date.now() - 3600000).toISOString(),
          read: false,
          link: '/calendario'
        },
        {
          id: 3,
          type: 'success',
          title: 'Abono Registrado',
          message: 'Se registró un abono de $100.000',
          fecha: new Date(Date.now() - 7200000).toISOString(),
          read: true,
          link: '/prestamos'
        },
        {
          id: 4,
          type: 'warning',
          title: 'Suscripción Próxima a Vencer',
          message: 'Tu suscripción vence en 5 días',
          fecha: new Date(Date.now() - 86400000).toISOString(),
          read: false,
          link: '/dashboard'
        }
      ]

      try {
        const response = await api.get('/notificaciones')
        setNotifications(response.data || mockNotifications)
      } catch (e) {
        // Si falla la petición, usar notificaciones mock
        setNotifications(mockNotifications)
      }

      // Calcular no leídas
      const currentNotifications = notifications.length > 0 ? notifications : mockNotifications
      const unread = currentNotifications.filter(n => !n.read).length
      setUnreadCount(unread)
    } catch (error) {
      console.error('Error al cargar notificaciones')
    }
  }

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ))
    setUnreadCount(Math.max(0, unreadCount - 1))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
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

