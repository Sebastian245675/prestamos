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
  const [ultimosMovimientos, setUltimosMovimientos] = useState([])
  const [actividadReciente, setActividadReciente] = useState([])
  const [resumenMovimientos, setResumenMovimientos] = useState({
    hoy: { entradas: 0, salidas: 0, neto: 0 },
    semana: { entradas: 0, salidas: 0, neto: 0 },
    mes: { entradas: 0, salidas: 0, neto: 0 }
  })
  const [filtroPeriodo, setFiltroPeriodo] = useState('HOY')
  const [loading, setLoading] = useState(true)

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

  useEffect(() => {
    if (user) {
      fetchDashboardData()
      fetchUltimosPrestamos()
      fetchUltimosMovimientos()
      fetchResumenMovimientos()
    }
  }, [user])

  useEffect(() => {
    // Combinar préstamos y movimientos en actividad reciente ordenados por fecha
    const combinarActividad = () => {
      const actividad = []
      
      // Agregar préstamos con tipo
      ultimosPrestamos.forEach(prestamo => {
        const fecha = parseFecha(prestamo.fechaCreacion)
        if (fecha) {
          actividad.push({
            tipo: 'PRESTAMO',
            id: prestamo.id,
            fecha: fecha,
            data: prestamo
          })
        }
      })
      
      // Agregar movimientos con tipo
      ultimosMovimientos.forEach(movimiento => {
        const fecha = movimiento.fecha ? new Date(movimiento.fecha) : new Date()
        if (fecha && !isNaN(fecha.getTime())) {
          actividad.push({
            tipo: 'MOVIMIENTO',
            id: movimiento.id,
            fecha: fecha,
            data: movimiento
          })
        }
      })
      
      // Ordenar por fecha descendente (más reciente primero) y tomar los últimos 4
      actividad.sort((a, b) => b.fecha - a.fecha)
      setActividadReciente(actividad.slice(0, 4))
    }
    
    combinarActividad()
  }, [ultimosPrestamos, ultimosMovimientos])
  
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
      
      // Tomar los últimos 5 préstamos (suficientes para combinar con movimientos y mostrar 4)
      const ultimos = prestamosData.slice(0, 5)
      setUltimosPrestamos(ultimos)
    } catch (error) {
      console.error('Error al cargar últimos préstamos:', error)
      setUltimosPrestamos([])
    }
  }

  const fetchUltimosMovimientos = async () => {
    if (!user?.id) return
    
    try {
      const movimientosData = await movimientosService.getMovimientos(user.id)
      
      // Tomar los últimos 5 movimientos (suficientes para combinar con préstamos y mostrar 4)
      const ultimos = movimientosData.slice(0, 5)
      setUltimosMovimientos(ultimos)
    } catch (error) {
      console.error('Error al cargar últimos movimientos:', error)
      setUltimosMovimientos([])
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
          .reduce((sum, m) => sum + (Number(m.monto) || 0), 0)
        const salidas = movimientos
          .filter(m => m.tipo === 'SALIDA')
          .reduce((sum, m) => sum + (Number(m.monto) || 0), 0)
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

  // Las ganancias se calculan solo con lo realmente cobrado (capital + intereses) - capital prestado
  // Si no hay nada cobrado, las ganancias son 0
  const ganancias = Math.max(0, stats.totalCobrado - stats.totalPrestado)

  const quickStats = [
    {
      label: 'Total Prestado',
      value: stats.totalPrestado,
      icon: <DollarSign className="text-blue-600" size={24} />,
      gradient: 'from-blue-50 to-blue-100 border-blue-200',
    },
    {
      label: 'Total Cobrado',
      value: stats.totalCobrado,
      icon: <TrendingUp className="text-emerald-600" size={24} />,
      gradient: 'from-emerald-50 to-emerald-100 border-emerald-200',
    },
    {
      label: 'Pendiente',
      value: stats.totalPendiente,
      icon: <AlertCircle className="text-amber-600" size={24} />,
      gradient: 'from-amber-50 to-amber-100 border-amber-200',
    },
    {
      label: 'Ganancias',
      value: ganancias,
      icon: <CheckCircle className="text-purple-600" size={24} />,
      gradient: 'from-purple-50 to-purple-100 border-purple-200',
    },
  ]

  const statusCards = [
    {
      label: 'Préstamos Activos',
      value: stats.prestamosActivos,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      icon: <CheckCircle className="text-emerald-600" size={22} />,
      link: '/prestamos?estado=ACTIVO',
    },
    {
      label: 'Préstamos Vencidos',
      value: stats.prestamosVencidos,
      color: 'text-red-600',
      iconBg: 'bg-red-50',
      icon: <AlertCircle className="text-red-600" size={22} />,
      link: '/prestamos?estado=VENCIDO',
    },
    {
      label: 'Préstamos Finalizados',
      value: stats.prestamosFinalizados,
      color: 'text-slate-600',
      iconBg: 'bg-slate-100',
      icon: <CheckCircle className="text-slate-500" size={22} />,
      link: '/prestamos?estado=FINALIZADO',
    },
  ]

  return (
    <div className="space-y-6 pb-24 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 hidden sm:block">
            Monitorea el desempeño de tu cartera en tiempo real desde cualquier dispositivo.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Link
          to="/prestamos/nuevo"
            className="btn-primary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
        >
            <Plus size={18} />
          <span>Nuevo Préstamo</span>
        </Link>
          <Link
            to="/movimientos"
            className="btn-secondary inline-flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Wallet size={18} />
            <span>Registrar Movimiento</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border bg-gradient-to-br p-5 shadow-sm flex items-center justify-between ${stat.gradient}`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${Number(stat.value || 0).toLocaleString('es-CO')}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/60 backdrop-blur flex items-center justify-center shadow-inner">
              {stat.icon}
          </div>
        </div>
        ))}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold mt-2 ${card.color}`}>
                  {Number(card.value || 0).toLocaleString('es-CO')}
                </p>
            </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${card.iconBg}`}>
                {card.icon}
            </div>
          </div>
            <div className="flex items-center text-sm font-medium text-primary-600">
            Ver detalles <ArrowRight size={16} className="ml-1" />
          </div>
        </Link>
        ))}
      </div>

      {/* Movimientos Financieros - Sección Avanzada */}
      <div className="space-y-4">
        {/* Header con Filtros y Acciones */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center justify-between sm:justify-start sm:space-x-2">
              <Activity className="text-primary-600 hidden sm:block" size={24} />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Movimientos financieros</h2>
              </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link 
                to="/movimientos" 
                className="btn-secondary inline-flex items-center gap-2 text-xs sm:text-sm"
              >
                <BarChart3 size={16} />
                <span>Ver detalles</span>
              </Link>
              <Link 
                to="/movimientos" 
                className="btn-primary inline-flex items-center gap-2 text-xs sm:text-sm"
              >
                <Plus size={16} />
                <span>Nuevo</span>
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
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              ${(resumenMovimientos[filtroPeriodo.toLowerCase()]?.entradas || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="text-red-600" size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">Salidas</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              ${(resumenMovimientos[filtroPeriodo.toLowerCase()]?.salidas || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-blue-600" size={20} />
              </div>
              <span className="text-xs text-gray-600 font-medium">Neto</span>
            </div>
            <p className={`text-xl sm:text-2xl font-bold mb-2 ${
              resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              ${(resumenMovimientos[filtroPeriodo.toLowerCase()]?.neto || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Filtros de Período */}
        <div className="card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Filter size={18} className="text-gray-600" />
              <span className="font-medium">Período</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['HOY', 'SEMANA', 'MES'].map((periodo) => (
                <button
                  key={periodo}
                  onClick={() => setFiltroPeriodo(periodo)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filtroPeriodo === periodo
                      ? 'bg-primary-600 text-white shadow'
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="text-primary-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">Actividad Reciente</h3>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Link to="/movimientos" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Movimientos →
              </Link>
              <Link to="/prestamos" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Préstamos →
              </Link>
            </div>
          </div>
          
          <div className="space-y-3">
            {actividadReciente.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-lg mb-2">No hay actividad reciente</p>
                <div className="flex items-center justify-center space-x-4 mt-4">
                  <Link to="/prestamos/nuevo" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Crear préstamo
                  </Link>
                  <span className="text-gray-300">|</span>
                  <Link to="/movimientos" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                    Crear movimiento
                  </Link>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Línea vertical del timeline */}
                <div className="absolute left-6 top-0 bottom-0 hidden sm:block w-0.5 bg-gray-200"></div>
                
                {actividadReciente.map((item, index) => {
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

                  if (item.tipo === 'PRESTAMO') {
                    const prestamo = item.data
                    
                    return (
                      <Link 
                        key={`prestamo-${prestamo.id}`} 
                        to={`/prestamos/${prestamo.id}`}
                        className="relative flex items-start space-x-4 pb-4 last:pb-0 block hover:opacity-80 transition-opacity"
                      >
                        {/* Punto del timeline */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white ${getEstadoColor(prestamo.estado)}`}>
                          <CreditCard className="text-white" size={16} />
                        </div>

                        {/* Contenido del préstamo */}
                        <div className={`flex-1 rounded-xl border-2 p-4 hover:shadow-md transition-all ${getEstadoBg(prestamo.estado)}`}>
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
                                    {item.fecha.toLocaleDateString('es-CO', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
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
                  } else if (item.tipo === 'MOVIMIENTO') {
                    const movimiento = item.data
                    
                    return (
                      <Link 
                        key={`movimiento-${movimiento.id}`} 
                        to="/movimientos"
                        className="relative flex items-start space-x-4 pb-4 last:pb-0 block hover:opacity-80 transition-opacity"
                      >
                        {/* Punto del timeline */}
                        <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-4 border-white ${
                          movimiento.tipo === 'ENTRADA' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {movimiento.tipo === 'ENTRADA' ? (
                            <TrendingUp className="text-white" size={16} />
                          ) : (
                            <TrendingDown className="text-white" size={16} />
                          )}
                        </div>

                        {/* Contenido del movimiento */}
                        <div className={`flex-1 rounded-xl border-2 p-4 hover:shadow-md transition-all ${
                          movimiento.tipo === 'ENTRADA' 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <p className="font-semibold text-gray-900">{movimiento.descripcion}</p>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  movimiento.tipo === 'ENTRADA'
                                    ? 'bg-green-200 text-green-800'
                                    : 'bg-red-200 text-red-800'
                                }`}>
                                  {movimiento.tipo}
                                </span>
                              </div>

                              {/* Información secundaria */}
                              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                                <Calendar size={14} className="text-gray-400" />
                                <span>
                                  {item.fecha.toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </span>
                                {movimiento.hora && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span>{movimiento.hora}</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Monto */}
                            <div className="text-right ml-4 flex-shrink-0">
                              <p className={`text-2xl font-bold mb-1 ${
                                movimiento.tipo === 'ENTRADA' ? 'text-green-700' : 'text-red-700'
                              }`}>
                                {movimiento.tipo === 'ENTRADA' ? '+' : '-'}$
                                {(Number(movimiento.monto) || 0).toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )
                  }
                  return null
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Mobile quick action dock */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] z-40">
        <div className="rounded-3xl border border-gray-200 bg-white shadow-lg px-4 py-3 flex items-center justify-between">
          <Link to="/prestamos" className="flex flex-col items-center text-xs font-medium text-gray-600">
            <CreditCard size={18} className="text-primary-600 mb-1" />
            Préstamos
          </Link>
          <Link to="/movimientos" className="flex flex-col items-center text-xs font-medium text-gray-600">
            <Wallet size={18} className="text-primary-600 mb-1" />
            Movimientos
          </Link>
          <Link to="/clientes" className="flex flex-col items-center text-xs font-medium text-gray-600">
            <User size={18} className="text-primary-600 mb-1" />
            Clientes
          </Link>
          <Link to="/reportes" className="flex flex-col items-center text-xs font-medium text-gray-600">
            <BarChart3 size={18} className="text-primary-600 mb-1" />
            Reportes
          </Link>
        </div>
      </div>
    </div>
  )
}

