import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { movimientosService } from '../services/movimientosService'
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Filter, 
  Calendar, 
  DollarSign, 
  Trash2, 
  Edit,
  Search,
  Download,
  Upload,
  Wallet,
  CreditCard,
  User,
  UserCircle,
  FileText,
  Clock,
  BarChart3,
  Activity,
  X,
  CheckCircle
} from 'lucide-react'

export default function Movimientos() {
  const { user } = useAuth()
  const [movimientos, setMovimientos] = useState([])
  const [resumen, setResumen] = useState({
    totalEntradas: 0,
    totalSalidas: 0,
    saldo: 0
  })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [filterTipo, setFilterTipo] = useState('TODOS')
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])
  const [busqueda, setBusqueda] = useState('')
  const [filtroPeriodoRapido, setFiltroPeriodoRapido] = useState(null)
  const [formData, setFormData] = useState({
    tipo: 'ENTRADA',
    monto: '',
    descripcion: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toTimeString().slice(0, 5),
    metodo: 'EFECTIVO',
    categoria: '',
    observaciones: '',
    clienteId: '',
    prestamoId: '',
    proveedor: ''
  })

  useEffect(() => {
    if (user) {
      fetchMovimientos()
      fetchResumen()
    }
  }, [fechaInicio, fechaFin, filterTipo, user])

  const fetchMovimientos = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const filters = {
        tipo: filterTipo !== 'TODOS' ? filterTipo : undefined,
        fechaDesde: fechaInicio,
        fechaHasta: fechaFin
      }
      
      const movimientosData = await movimientosService.getMovimientos(user.id, filters)
      setMovimientos(movimientosData)
    } catch (error) {
      console.error('Error al cargar los movimientos:', error)
      toast.error('Error al cargar los movimientos')
      setMovimientos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchResumen = async () => {
    if (!user?.id) return
    
    try {
      const resumenData = await movimientosService.getResumen(user.id)
      
      // Calcular resumen desde los movimientos si no viene del backend
      if (resumenData.totalEntradas === undefined) {
        const totalEntradas = movimientos
          .filter(m => m.tipo === 'ENTRADA')
          .reduce((sum, m) => sum + m.monto, 0)
        const totalSalidas = movimientos
          .filter(m => m.tipo === 'SALIDA')
          .reduce((sum, m) => sum + m.monto, 0)
        
        setResumen({
          totalEntradas,
          totalSalidas,
          saldo: totalEntradas - totalSalidas
        })
      } else {
        setResumen(resumenData)
      }
    } catch (error) {
      console.error('Error al cargar resumen:', error)
      // Calcular desde movimientos locales
      const totalEntradas = movimientos
        .filter(m => m.tipo === 'ENTRADA')
        .reduce((sum, m) => sum + m.monto, 0)
      const totalSalidas = movimientos
        .filter(m => m.tipo === 'SALIDA')
        .reduce((sum, m) => sum + m.monto, 0)
      
      setResumen({
        totalEntradas,
        totalSalidas,
        saldo: totalEntradas - totalSalidas
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión para registrar un movimiento')
      return
    }
    
    try {
      const monto = parseFloat(formData.monto)
      if (isNaN(monto) || monto <= 0) {
        toast.error('El monto debe ser mayor a cero')
        return
      }
      
      await movimientosService.createMovimiento(user.id, {
        tipo: formData.tipo,
        monto: monto,
        descripcion: formData.descripcion,
        fecha: formData.fecha,
        observaciones: formData.observaciones || null
      })
      
      toast.success('Movimiento registrado exitosamente')
      setShowModal(false)
      setFormData({
        tipo: 'ENTRADA',
        monto: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: new Date().toTimeString().slice(0, 5),
        metodo: 'EFECTIVO',
        categoria: '',
        observaciones: '',
        clienteId: '',
        prestamoId: '',
        proveedor: ''
      })
      
      // Recargar movimientos y resumen
      await Promise.all([
        fetchMovimientos(),
        fetchResumen()
      ])
    } catch (error) {
      console.error('Error al registrar movimiento:', error)
      toast.error(error.response?.data?.message || 'Error al registrar el movimiento')
    }
  }

  const categoriasEntrada = [
    { value: 'COBRO_PRESTAMO', label: 'Cobro de Préstamo' },
    { value: 'INTERESES', label: 'Intereses' },
    { value: 'MORA', label: 'Mora' },
    { value: 'INGRESO_OTRO', label: 'Otro Ingreso' }
  ]

  const categoriasSalida = [
    { value: 'GASTO_OPERATIVO', label: 'Gasto Operativo' },
    { value: 'GASTO_ADMINISTRATIVO', label: 'Gasto Administrativo' },
    { value: 'GASTO_TRANSPORTE', label: 'Transporte' },
    { value: 'GASTO_SERVICIOS', label: 'Servicios Públicos' },
    { value: 'GASTO_MARKETING', label: 'Marketing' },
    { value: 'GASTO_OTRO', label: 'Otro Gasto' }
  ]

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este movimiento?')) {
      return
    }
    
    try {
      await movimientosService.deleteMovimiento(id)
      toast.success('Movimiento eliminado exitosamente')
      
      // Recargar movimientos y resumen
      await Promise.all([
        fetchMovimientos(),
        fetchResumen()
      ])
    } catch (error) {
      console.error('Error al eliminar movimiento:', error)
      toast.error('Error al eliminar el movimiento')
    }
  }

  const filteredMovimientos = movimientos.filter(movimiento => {
    if (filterTipo !== 'TODOS' && movimiento.tipo !== filterTipo) {
      return false
    }
    if (busqueda && !movimiento.descripcion.toLowerCase().includes(busqueda.toLowerCase()) &&
        !movimiento.observaciones?.toLowerCase().includes(busqueda.toLowerCase()) &&
        !movimiento.cliente?.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
      return false
    }
    return true
  })

  const aplicarFiltroRapido = (periodo) => {
    const hoy = new Date()
    if (periodo === 'HOY') {
      setFechaInicio(hoy.toISOString().split('T')[0])
      setFechaFin(hoy.toISOString().split('T')[0])
      setFiltroPeriodoRapido('HOY')
    } else if (periodo === 'SEMANA') {
      const inicioSemana = new Date(hoy)
      inicioSemana.setDate(hoy.getDate() - hoy.getDay())
      setFechaInicio(inicioSemana.toISOString().split('T')[0])
      setFechaFin(hoy.toISOString().split('T')[0])
      setFiltroPeriodoRapido('SEMANA')
    } else if (periodo === 'MES') {
      const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      setFechaInicio(inicioMes.toISOString().split('T')[0])
      setFechaFin(hoy.toISOString().split('T')[0])
      setFiltroPeriodoRapido('MES')
    } else {
      setFiltroPeriodoRapido(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Header Mejorado para Móvil */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200 p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <Activity className="text-primary-600 flex-shrink-0" size={24} />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">Movimientos Financieros</h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Registro completo de entradas y salidas de efectivo</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => toast.info('Función de exportar próximamente')}
              className="btn-secondary inline-flex items-center justify-center space-x-2 h-12 text-sm font-medium touch-manipulation"
              title="Exportar a Excel"
            >
              <Download size={18} />
              <span>Exportar</span>
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center justify-center space-x-2 h-12 text-sm font-semibold touch-manipulation active:scale-95"
            >
              <Plus size={20} />
              <span>Nuevo Movimiento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Resumen - Optimizado para Móvil */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Total Entradas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                ${resumen.totalEntradas?.toLocaleString('es-CO') || 0}
              </p>
            </div>
            <TrendingUp className="text-green-600 flex-shrink-0 ml-2" size={28} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Total Salidas</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                ${resumen.totalSalidas?.toLocaleString('es-CO') || 0}
              </p>
            </div>
            <TrendingDown className="text-red-600 flex-shrink-0 ml-2" size={28} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-1.5 sm:mb-2">Saldo</p>
              <p className={`text-xl sm:text-2xl font-bold truncate ${
                resumen.saldo >= 0 ? 'text-green-700' : 'text-red-700'
              }`}>
                ${resumen.saldo?.toLocaleString('es-CO') || 0}
              </p>
            </div>
            <DollarSign className="text-blue-600 flex-shrink-0 ml-2" size={28} />
          </div>
        </div>
      </div>

      {/* Filtros Avanzados - Optimizados para Móvil */}
      <div className="space-y-3 sm:space-y-4">
        {/* Filtros Rápidos */}
        <div className="card p-4 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-2">
              <Filter size={18} className="text-gray-600 flex-shrink-0" />
              <span className="text-sm font-semibold text-gray-700">Filtros Rápidos</span>
            </div>
            {filtroPeriodoRapido && (
              <button
                onClick={() => {
                  setFiltroPeriodoRapido(null)
                  setFechaInicio(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
                  setFechaFin(new Date().toISOString().split('T')[0])
                }}
                className="text-xs text-primary-600 active:text-primary-700 font-medium flex items-center space-x-1 touch-manipulation px-2 py-1 active:bg-primary-50 rounded"
              >
                <X size={16} />
                <span>Limpiar</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {['HOY', 'SEMANA', 'MES'].map((periodo) => (
              <button
                key={periodo}
                onClick={() => aplicarFiltroRapido(periodo)}
                className={`px-4 py-2.5 sm:py-2 rounded-xl text-sm font-semibold transition-all touch-manipulation active:scale-95 flex-1 sm:flex-none min-w-[80px] sm:min-w-0 ${
                  filtroPeriodoRapido === periodo
                    ? 'bg-primary-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                }`}
              >
                {periodo}
              </button>
            ))}
          </div>
        </div>

        {/* Filtros Detallados */}
        <div className="card p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar movimiento..."
                className="input-field pl-10 h-12 sm:h-auto text-base"
              />
            </div>

            {/* Tipo de Movimiento */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
              <select
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="input-field pl-10 h-12 sm:h-auto text-base appearance-none bg-white"
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="ENTRADA">Solo Entradas</option>
                <option value="SALIDA">Solo Salidas</option>
              </select>
            </div>

            {/* Rango de Fechas */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2 items-center">
              <Calendar className="text-gray-400 flex-shrink-0" size={18} />
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => {
                  setFechaInicio(e.target.value)
                  setFiltroPeriodoRapido(null)
                }}
                className="input-field h-12 sm:h-auto text-sm sm:text-base col-span-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-2 items-center sm:hidden">
              <span className="text-gray-600 text-sm">a</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value)
                  setFiltroPeriodoRapido(null)
                }}
                className="input-field h-12 text-sm col-span-2"
              />
            </div>
            <div className="hidden sm:grid sm:grid-cols-3 sm:gap-2 items-center">
              <span className="text-gray-600 text-sm">a</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => {
                  setFechaFin(e.target.value)
                  setFiltroPeriodoRapido(null)
                }}
                className="input-field col-span-2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Movimientos - Optimizada para Móvil */}
      <div className="card p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <FileText className="text-primary-600 flex-shrink-0" size={20} />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Historial</h2>
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex-shrink-0">
              {filteredMovimientos.length}
            </span>
          </div>
        </div>
        
        {filteredMovimientos.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Activity className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 text-base sm:text-lg mb-2">No se encontraron movimientos</p>
            <p className="text-gray-400 text-sm mb-4 px-4">
              {busqueda || filterTipo !== 'TODOS' 
                ? 'Intenta ajustar los filtros' 
                : 'Comienza registrando tu primer movimiento'}
            </p>
            {!busqueda && filterTipo === 'TODOS' && (
              <button
                onClick={() => setShowModal(true)}
                className="btn-primary inline-flex items-center space-x-2 h-12 touch-manipulation"
              >
                <Plus size={18} />
                <span>Registrar Primer Movimiento</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredMovimientos.map((movimiento) => (
              <div
                key={movimiento.id}
                className={`group relative rounded-xl border-2 p-4 sm:p-5 active:shadow-lg transition-all touch-manipulation ${
                  movimiento.tipo === 'ENTRADA'
                    ? 'bg-green-50 border-green-200 active:border-green-300'
                    : 'bg-red-50 border-red-200 active:border-red-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  {/* Columna Izquierda - Información Principal */}
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                    {/* Icono del Movimiento */}
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      movimiento.tipo === 'ENTRADA' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {movimiento.tipo === 'ENTRADA' ? (
                        <TrendingUp className="text-green-600" size={20} />
                      ) : (
                        <TrendingDown className="text-red-600" size={20} />
                      )}
                    </div>

                    {/* Información del Movimiento */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2 sm:mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 mb-2">
                            <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{movimiento.descripcion}</h3>
                            <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                              movimiento.tipo === 'ENTRADA'
                                ? 'bg-green-200 text-green-800'
                                : 'bg-red-200 text-red-800'
                            }`}>
                              {movimiento.tipo}
                            </span>
                          </div>

                          {/* Información Secundaria - Optimizada para móvil */}
                          <div className="space-y-1.5 sm:space-y-2 mb-2 sm:mb-3">
                            {movimiento.cliente && (
                              <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600">
                                <UserCircle size={14} className="text-gray-400 flex-shrink-0" />
                                <span className="font-medium truncate">{movimiento.cliente.nombre}</span>
                                {movimiento.prestamo && (
                                  <>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-primary-600 font-medium truncate">{movimiento.prestamo.numero}</span>
                                  </>
                                )}
                              </div>
                            )}
                            
                            <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                              <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-600">
                                {movimiento.metodo === 'EFECTIVO' ? (
                                  <Wallet size={14} className="text-gray-400 flex-shrink-0" />
                                ) : (
                                  <CreditCard size={14} className="text-gray-400 flex-shrink-0" />
                                )}
                                <span>{movimiento.metodo}</span>
                              </div>
                              
                              {movimiento.usuario && (
                                <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-gray-600">
                                  <User size={14} className="text-gray-400 flex-shrink-0" />
                                  <span className="truncate">{movimiento.usuario.nombre}</span>
                                  {movimiento.usuario.rol === 'COBRADOR' && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium flex-shrink-0">
                                      Cobrador
                                    </span>
                                  )}
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1.5 text-xs text-gray-500">
                                <Clock size={14} className="text-gray-400 flex-shrink-0" />
                                <span>
                                  {new Date(movimiento.fecha).toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: 'short'
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
                          </div>

                          {/* Observaciones */}
                          {movimiento.observaciones && (
                            <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600 bg-white/50 rounded-lg p-2 sm:p-3 mt-2">
                              <FileText size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="flex-1 line-clamp-2">{movimiento.observaciones}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha - Monto y Acciones */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:space-y-3 flex-shrink-0 sm:ml-6">
                    <div className="text-left sm:text-right">
                      <p className={`text-xl sm:text-2xl font-bold mb-0.5 sm:mb-1 ${
                        movimiento.tipo === 'ENTRADA' ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {movimiento.tipo === 'ENTRADA' ? '+' : '-'}
                        ${movimiento.monto?.toLocaleString('es-CO')}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">
                        {new Date(movimiento.fecha).toLocaleDateString('es-CO', {
                          weekday: 'short'
                        })}
                      </p>
                    </div>

                    {/* Botones de Acción - Siempre visibles en móvil */}
                    <div className="flex items-center space-x-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toast.info('Función de editar próximamente')}
                        className="p-2.5 sm:p-2 text-blue-600 active:bg-blue-100 rounded-lg transition-colors touch-manipulation"
                        title="Editar"
                        aria-label="Editar"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(movimiento.id)}
                        className="p-2.5 sm:p-2 text-red-600 active:bg-red-100 rounded-lg transition-colors touch-manipulation"
                        title="Eliminar"
                        aria-label="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Nuevo Movimiento Mejorado para Móvil */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-xl max-w-2xl w-full p-4 sm:p-6 my-0 sm:my-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Header del Modal - Simplificado */}
            <div className="relative mb-6 pb-4 border-b border-gray-200">
              {/* Barra de arrastre para móvil */}
              <div className="sm:hidden absolute -top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full"></div>
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Nuevo Movimiento</h2>
                
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 pb-4">
              {/* Tipo de Movimiento - Sutil y elegante */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Movimiento *
                </label>
                <div className="inline-flex bg-gray-100 rounded-lg p-1 w-full">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'ENTRADA', categoria: '' })}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md transition-all ${
                      formData.tipo === 'ENTRADA'
                        ? 'bg-white text-green-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingUp size={18} className={formData.tipo === 'ENTRADA' ? 'text-green-600' : 'text-gray-400'} />
                    <span className="font-medium text-sm">Entrada</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'SALIDA', categoria: '' })}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-md transition-all ${
                      formData.tipo === 'SALIDA'
                        ? 'bg-white text-red-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <TrendingDown size={18} className={formData.tipo === 'SALIDA' ? 'text-red-600' : 'text-gray-400'} />
                    <span className="font-medium text-sm">Salida</span>
                  </button>
                </div>
              </div>

              {/* Monto - Optimizado para móvil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold text-lg">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    className="input-field pl-12 text-lg h-14 sm:h-12"
                    required
                    min="1"
                    step="0.01"
                    placeholder="0.00"
                    inputMode="decimal"
                  />
                </div>
              </div>

              {/* Método de Pago - Optimizado para móvil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Método de Pago *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metodo: 'EFECTIVO' })}
                    className={`p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-95 flex flex-col items-center justify-center space-y-2 ${
                      formData.metodo === 'EFECTIVO'
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white active:bg-gray-50'
                    }`}
                  >
                    <Wallet size={24} className={formData.metodo === 'EFECTIVO' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className={`text-sm font-semibold ${formData.metodo === 'EFECTIVO' ? 'text-primary-700' : 'text-gray-600'}`}>
                      Efectivo
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, metodo: 'TRANSFERENCIA' })}
                    className={`p-4 rounded-xl border-2 transition-all touch-manipulation active:scale-95 flex flex-col items-center justify-center space-y-2 ${
                      formData.metodo === 'TRANSFERENCIA'
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 bg-white active:bg-gray-50'
                    }`}
                  >
                    <CreditCard size={24} className={formData.metodo === 'TRANSFERENCIA' ? 'text-primary-600' : 'text-gray-400'} />
                    <span className={`text-sm font-semibold ${formData.metodo === 'TRANSFERENCIA' ? 'text-primary-700' : 'text-gray-600'}`}>
                      Transferencia
                    </span>
                  </button>
                </div>
              </div>

              {/* Descripción - Optimizado para móvil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Descripción *
                </label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="input-field h-14 sm:h-12 text-base"
                  required
                  placeholder="Ej: Cobro de préstamo #123..."
                />
                <p className="text-xs text-gray-500 mt-2">Describe brevemente el movimiento</p>
              </div>

              {/* Categoría - Optimizado para móvil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Categoría
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="input-field h-14 sm:h-12 text-base"
                >
                  <option value="">Seleccionar categoría (opcional)</option>
                  {(formData.tipo === 'ENTRADA' ? categoriasEntrada : categoriasSalida).map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Hora - Optimizado para móvil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Fecha *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={formData.fecha}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      className="input-field pl-12 h-14 sm:h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Hora
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="time"
                      value={formData.hora}
                      onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                      className="input-field pl-12 h-14 sm:h-12 text-base"
                    />
                  </div>
                </div>
              </div>


              {/* Información Adicional para Salidas - Optimizado para móvil */}
              {formData.tipo === 'SALIDA' && (
                <div className="p-4 bg-red-50 rounded-xl border border-red-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Proveedor/Entidad (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                    className="input-field h-14 sm:h-12 text-base"
                    placeholder="Ej: Empresa de Servicios..."
                  />
                </div>
              )}

              {/* Observaciones - Optimizado para móvil */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                  className="input-field text-base min-h-[100px] sm:min-h-[80px]"
                  rows="4"
                  placeholder="Notas adicionales, detalles, referencias..."
                />
                <p className="text-xs text-gray-500 mt-2">Agrega información adicional que pueda ser útil</p>
              </div>

              {/* Botones de Acción - Optimizados para móvil */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white -mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-secondary h-14 sm:h-12 text-base font-semibold touch-manipulation"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className={`btn-primary inline-flex items-center justify-center space-x-2 h-14 sm:h-12 text-base font-semibold touch-manipulation active:scale-95 ${
                    formData.tipo === 'ENTRADA' ? 'bg-green-600 hover:bg-green-700 active:bg-green-800' : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
                  }`}
                >
                  <CheckCircle size={20} />
                  <span>Registrar Movimiento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

