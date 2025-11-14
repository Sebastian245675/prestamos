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
import LiquidacionCobradores from './pages/LiquidacionCobradores'
import Movimientos from './pages/Movimientos'
import Clientes from './pages/Clientes'
import DetalleCliente from './pages/DetalleCliente'
import Perfil from './pages/Perfil'
import Soporte from './pages/Soporte'
import Referidos from './pages/Referidos'
import ClientePortal from './pages/cliente/ClientePortal'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
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
          <Route path="/dashboard" element={<ProtectedRoute permiso="verPrestamos" siempreVisible><Dashboard /></ProtectedRoute>} />
          <Route path="/prestamos" element={<ProtectedRoute permiso="verPrestamos"><Prestamos /></ProtectedRoute>} />
          <Route path="/prestamos/nuevo" element={<ProtectedRoute permiso="editarPrestamos"><NuevoPrestamo /></ProtectedRoute>} />
          <Route path="/prestamos/:id" element={<ProtectedRoute permiso="verPrestamos"><DetallePrestamo /></ProtectedRoute>} />
          <Route path="/calendario" element={<ProtectedRoute permiso="verCalendario"><Calendario /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute permiso="verReportes"><Reportes /></ProtectedRoute>} />
          <Route path="/cobradores" element={<ProtectedRoute soloPrestamista><Cobradores /></ProtectedRoute>} />
          <Route path="/cobradores/liquidacion" element={<ProtectedRoute soloPrestamista><LiquidacionCobradores /></ProtectedRoute>} />
          <Route path="/movimientos" element={<ProtectedRoute permiso="verPrestamos"><Movimientos /></ProtectedRoute>} />
          <Route path="/clientes" element={<ProtectedRoute permiso="gestionarClientes"><Clientes /></ProtectedRoute>} />
          <Route path="/clientes/:id" element={<ProtectedRoute permiso="gestionarClientes"><DetalleCliente /></ProtectedRoute>} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/soporte" element={<Soporte />} />
          <Route path="/referidos" element={<ProtectedRoute soloPrestamista><Referidos /></ProtectedRoute>} />
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

