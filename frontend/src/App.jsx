import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import Dashboard from './pages/Dashboard'
import Prestamos from './pages/Prestamos'
import NuevoPrestamo from './pages/NuevoPrestamo'
import DetallePrestamo from './pages/DetallePrestamo'
import Calendario from './pages/Calendario'
import Reportes from './pages/Reportes'
import Cobradores from './pages/Cobradores'
import Movimientos from './pages/Movimientos'
import Clientes from './pages/Clientes'
import DetalleCliente from './pages/DetalleCliente'
import Perfil from './pages/Perfil'
import Soporte from './pages/Soporte'
import Referidos from './pages/Referidos'
import ClientePortal from './pages/cliente/ClientePortal'
import Layout from './components/Layout'
import { NotificationProvider } from './context/NotificationContext'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
      <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
      <Route path="/cliente/:id" element={<ClientePortal />} />
      
      {user ? (
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/prestamos" element={<Prestamos />} />
          <Route path="/prestamos/nuevo" element={<NuevoPrestamo />} />
          <Route path="/prestamos/:id" element={<DetallePrestamo />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/cobradores" element={<Cobradores />} />
          <Route path="/movimientos" element={<Movimientos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes/:id" element={<DetalleCliente />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/referidos" element={<Referidos />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" />} />
      )}
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App

