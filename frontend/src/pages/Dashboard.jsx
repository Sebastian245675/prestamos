import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { prestamosService } from '../services/prestamosService'
import { movimientosService } from '../services/movimientosService'
import api from '../utils/api'
import { 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  ArrowRight,
  Plus,
  User,
  CreditCard,
  Wallet,
  UserCircle,
  TrendingDown,
  Clock,
  Calendar,
  Filter,
  BarChart3,
  Activity,
  MapPin
} from 'lucide-react'
import { toast } from 'react-toastify'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalPrestado: 0,
    totalCobrado: 0,
    totalPendiente: 0,
    prestamosActivos: 0,
    prestamosVencidos: 0,
    prestamosFinalizados: 0
  })
  const [ultimosPrestamos, setUltimosPrestamos] = useState([])
  const [resumenMovimientos, setResumenMovimientos] = useState({
    hoy: { entradas: 0, salidas: 0, neto: 0 },
    semana: { entradas: 0, salidas: 0, neto: 0 },
    mes: { entradas: 0, salidas: 0, neto: 0 }
  })
  const [filtroPeriodo, setFiltroPeriodo] = useState('HOY')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUltimosPrestamos()
      fetchResumenMovimientos()
    }
  }, [user])
  
  useEffect(() => {
    if (user) {
      fetchResumenMovimientos()
    }
  }, [filtroPeriodo])

  const fetchDashboardData = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const response = await api.get('/prestamos/dashboard')
      
      setStats({
        totalPrestado: parseFloat(response.data.totalPrestado) || 0,
        totalCobrado: parseFloat(response.data.totalCobrado) || 0,
        totalPendiente: parseFloat(response.data.totalPendiente) || 0,
        prestamosActivos: response.data.prestamosActivos || 0,
        prestamosVencidos: response.data.prestamosVencidos || 0,
        prestamosFinalizados: response.data.prestamosFinalizados || 0
      })
    } catch (error) {
      console.error('Error al cargar dashboard:', error)
      // Mantener valores por defecto en caso de error
      setStats({
        totalPrestado: 0,
        totalCobrado: 0,
        totalPendiente: 0,
        prestamosActivos: 0,
        prestamosVencidos: 0,
        prestamosFinalizados: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchUltimosPrestamos = async () => {
    if (!user?.id) return
    
    try {
      const prestamosData = await prestamosService.getPrestamos(user.id)
      
      // Tomar los últimos 5 préstamos ordenados por fecha de creación
      const ultimos = prestamosData.slice(0, 5)
      setUltimosPrestamos(ultimos)
    } catch (error) {
      console.error('Error al cargar últimos préstamos:', error)
      setUltimosPrestamos([])
    }
  }

  const fetchResumenMovimientos = async () => {
    if (!user?.id) return
    
    try {
      const hoy = new Date()
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay())
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      
      // Obtener movimientos para cada período
      const [movimientosHoy, movimientosSemana, movimientosMes] = await Promise.all([
        movimientosService.getMovimientos(user.id, {
          fechaDesde: hoy.toISOString().split('T')[0],
          fechaHasta: hoy.toISOString().split('T')[0]
        }),
        movimientosService.getMovimientos(user.id, {
          fechaDesde: inicioSemana.toISOString().split('T')[0],
          fechaHasta: hoy.toISOString().split('T')[0]
        }),
        movimientosService.getMovimientos(user.id, {
          fechaDesde: inicioMes.toISOString().split('T')[0],
          fechaHasta: hoy.toISOString().split('T')[0]
        })
      ])
      
      const calcularResumen = (movimientos) => {
        const entradas = movimientos
          .filter(m => m.tipo === 'ENTRADA')
          .reduce((sum, m) => sum + m.monto, 0)
        const salidas = movimientos
          .filter(m => m.tipo === 'SALIDA')
          .reduce((sum, m) => sum + m.monto, 0)
        return {
          entradas,
          salidas,
          neto: entradas - salidas
        }
      }
      
      setResumenMovimientos({
        hoy: calcularResumen(movimientosHoy),
        semana: calcularResumen(movimientosSemana),
        mes: calcularResumen(movimientosMes)
      })
    } catch (error) {
      console.error('Error al cargar resumen de movimientos:', error)
      setResumenMovimientos({
        hoy: { entradas: 0, salidas: 0, neto: 0 },
        semana: { entradas: 0, salidas: 0, neto: 0 },
        mes: { entradas: 0, salidas: 0, neto: 0 }
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // Función helper para parsear fechas desde el backend (puede venir como LocalDateTime array o string)
  const parseFecha = (fecha) => {
    if (!fecha) return null
    
    try {
      // Si es un array (formato LocalDateTime de Java: [year, month, day, hour, minute, second])
      if (Array.isArray(fecha)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = fecha
        return new Date(year, month - 1, day, hour, minute, second)
      }
      
      // Si es un string ISO
      if (typeof fecha === 'string') {
        return new Date(fecha)
      }
      
      return null
    } catch (e) {
      console.error('Error parsing fecha:', fecha, e)
      return null
    }
  }

  // Las ganancias se calculan solo con lo realmente cobrado (capital + intereses) - capital prestado
  // Si no hay nada cobrado, las ganancias son 0
  const ganancias = Math.max(0, stats.totalCobrado - stats.totalPrestado)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Resumen de tu actividad</p>
        </div>
        <Link
          to="/prestamos/nuevo"
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Préstamo</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Prestado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalPrestado.toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Cobrado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalCobrado.toLocaleString('es-CO')}
              </p>
            </div>
            <TrendingUp className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalPendiente.toLocaleString('es-CO')}
              </p>
            </div>
            <AlertCircle className="text-yellow-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ganancias</p>
              <p className="text-2xl font-bold text-gray-900">
                ${ganancias.toLocaleString('es-CO')}
              </p>
            </div>
            <CheckCircle className="text-purple-600" size={32} />
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/prestamos?estado=ACTIVO" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Préstamos Activos</p>
              <p className="text-3xl font-bold text-primary-600">{stats.prestamosActivos}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-primary-600">
            Ver detalles <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link to="/prestamos?estado=VENCIDO" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Préstamos Vencidos</p>
              <p className="text-3xl font-bold text-red-600">{stats.prestamosVencidos}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="text-red-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            Ver detalles <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>

        <Link to="/prestamos?estado=FINALIZADO" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Préstamos Finalizados</p>
              <p className="text-3xl font-bold text-gray-600">{stats.prestamosFinalizados}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-gray-600" size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-600">
            Ver detalles <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>
      </div>

      {/* Movimientos Financieros - Sección Avanzada */}
      <div className="space-y-4">
        {/* Header con Filtros y Acciones */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="text-primary-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Movimientos Financieros</h2>
              </div>
              <p className="text-sm text-gray-600">Seguimiento en tiempo real de tus flujos de efectivo</p>
            </div>
            <div className="flex items-center space-x-2">
              <Link 
                to="/movimientos" 
                className="btn-secondary inline-flex items-center space-x-2"
              >
                <BarChart3 size={18} />
                <span>Ver Detallado</span>
              </Link>
              <Link 
                to="/movimientos" 
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus size={18} />
                <span>Nuevo Movimiento</span>
              </Link>
            </div>
          </div>
        </div>

        {/* KPIs Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">Entradas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${resumenMovimientos[filtroPeriodo.toLowerCase()]?.entradas?.toLocaleString('es-CO') || 0}
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-green-600">↑</span>
              <span className="text-gray-600">Crecimiento positivo</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">Salidas</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mb-1">
              ${resumenMovimientos[filtroPeriodo.toLowerCase()]?.salidas?.toLocaleString('es-CO') || 0}
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <span className="text-gray-600">Control de gastos</span>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">Neto</span>
            </div>
            <p className={`text-2xl font-bold mb-1 ${
              resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              ${resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto?.toLocaleString('es-CO') || 0}
            </p>
            <div className="flex items-center space-x-1 text-xs">
              <span className={resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto >= 0 ? 'text-green-600' : 'text-red-600'}>
                {resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto >= 0 ? '↑' : '↓'}
              </span>
              <span className="text-gray-600">Balance {filtroPeriodo.toLowerCase()}</span>
            </div>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
            </div>
            <div className="flex items-center space-x-2">
              {['HOY', 'SEMANA', 'MES'].map((periodo) => (
                <button
                  key={periodo}
                  onClick={() => setFiltroPeriodo(periodo)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === periodo
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {periodo}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline de Préstamos Recientes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            </div>
            <Link to="/prestamos" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver completo →
            </Link>
          </div>
          
          <div className="space-y-3">
            {ultimosPrestamos.length === 0 ? (
              <div className="text-center py-12">
                <CreditCard className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-lg mb-2">No hay préstamos registrados</p>
                <Link to="/prestamos/nuevo" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  Crear primer préstamo
                </Link>
              </div>
            ) : (
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                
                {ultimosPrestamos.map((prestamo, index) => {
                  const getEstadoColor = (estado) => {
                    switch (estado) {
                      case 'ACTIVO':
                        return 'bg-green-500'
                      case 'VENCIDO':
                        return 'bg-red-500'
                      case 'FINALIZADO':
                        return 'bg-gray-500'
                      default:
                        return 'bg-blue-500'
                    }
                  }
                  
                  const getEstadoBg = (estado) => {
                    switch (estado) {
                      case 'ACTIVO':
                        return 'bg-green-50 border-green-200'
                      case 'VENCIDO':
                        return 'bg-red-50 border-red-200'
                      case 'FINALIZADO':
                        return 'bg-gray-50 border-gray-200'
                      default:
                        return 'bg-blue-50 border-blue-200'
                    }
                  }
                  
                  return (
                    <Link 
                      key={prestamo.id} 
                      to={`/prestamos/${prestamo.id}`}
                      className="relative flex items-start space-x-4 pb-4 last:pb-0 block hover:opacity-80 transition-opacity"
                    >
                      {/* Punto del timeline */}
                      <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white ${getEstadoColor(prestamo.estado)}`}>
                        <CreditCard className="text-white" size={16} />
                      </div>

                      {/* Contenido del préstamo */}
                      <div className={`flex-1 rounded-lg border-2 p-4 hover:shadow-md transition-all ${getEstadoBg(prestamo.estado)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <p className="font-semibold text-gray-900">{prestamo.nombreCliente}</p>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                prestamo.estado === 'ACTIVO'
                                  ? 'bg-green-200 text-green-800'
                                  : prestamo.estado === 'VENCIDO'
                                  ? 'bg-red-200 text-red-800'
                                  : 'bg-gray-200 text-gray-800'
                              }`}>
                                {prestamo.estado}
                              </span>
                            </div>

                            {/* Información secundaria */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                              {prestamo.telefono && (
                                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                                  <UserCircle size={14} className="text-gray-400" />
                                  <span>{prestamo.telefono}</span>
                                </div>
                              )}
                              
                              {prestamo.zona && (
                                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                                  <MapPin size={14} className="text-gray-400" />
                                  <span>{prestamo.zona}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                                <Calendar size={14} className="text-gray-400" />
                                <span>
                                  {(() => {
                                    const fecha = parseFecha(prestamo.fechaCreacion)
                                    if (!fecha || isNaN(fecha.getTime())) {
                                      return 'Sin fecha'
                                    }
                                    return fecha.toLocaleDateString('es-CO', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })
                                  })()}
                                </span>
                              </div>
                              
                              {prestamo.numeroCuotas && (
                                <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                                  <CreditCard size={14} className="text-gray-400" />
                                  <span>{prestamo.cuotasPagadas || 0}/{prestamo.numeroCuotas} cuotas</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Monto */}
                          <div className="text-right ml-4 flex-shrink-0">
                            <p className="text-2xl font-bold text-gray-900 mb-1">
                              ${typeof prestamo.montoPrestado === 'number' ? prestamo.montoPrestado.toLocaleString('es-CO') : parseFloat(prestamo.montoPrestado || 0).toLocaleString('es-CO')}
                            </p>
                            {prestamo.saldoPendiente !== undefined && (
                              <p className="text-sm text-gray-600">
                                Pendiente: ${typeof prestamo.saldoPendiente === 'number' ? prestamo.saldoPendiente.toLocaleString('es-CO') : parseFloat(prestamo.saldoPendiente || 0).toLocaleString('es-CO')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

