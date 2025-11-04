import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import Calendar from 'react-calendar'
import { format, addDays, isToday, isPast, differenceInDays } from 'date-fns'
import { 
  DollarSign, 
  User, 
  MapPin, 
  Filter, 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import 'react-calendar/dist/Calendar.css'

export default function Calendario() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [cobros, setCobros] = useState([])
  const [proximosCobros, setProximosCobros] = useState([])
  const [eventos, setEventos] = useState([])
  const [filterZona, setFilterZona] = useState('TODAS')
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEventoModal, setShowEventoModal] = useState(false)
  const [proximosCobrosExpandido, setProximosCobrosExpandido] = useState(false)
  const [eventoForm, setEventoForm] = useState({
    titulo: '',
    descripcion: '',
    fecha: format(new Date(), 'yyyy-MM-dd'),
    hora: '',
    tipo: 'EVENTO',
    color: 'blue'
  })

  useEffect(() => {
    fetchCobros()
    fetchProximosCobros()
    fetchEventos()
    fetchZonas()
  }, [selectedDate, filterZona])

  const fetchCobros = async () => {
    try {
      const mockCobros = [
        {
          id: 1,
          nombreCliente: 'Juan Pérez',
          zona: 'Zona Norte',
          fechaVencimiento: format(selectedDate, 'yyyy-MM-dd'),
          saldoPendiente: 500000,
          estado: 'ACTIVO',
          montoCuota: 83333,
          prestamoId: 123,
          telefono: '3001234567'
        },
        {
          id: 2,
          nombreCliente: 'María García',
          zona: 'Zona Sur',
          fechaVencimiento: format(selectedDate, 'yyyy-MM-dd'),
          saldoPendiente: 300000,
          estado: 'VENCIDO',
          montoCuota: 50000,
          prestamoId: 456,
          telefono: '3009876543'
        }
      ]
      
      try {
        const response = await axios.get('/api/prestamos/calendario', {
          params: {
            fecha: format(selectedDate, 'yyyy-MM-dd'),
            zona: filterZona !== 'TODAS' ? filterZona : null
          }
        })
        setCobros(response.data)
      } catch (e) {
        setCobros(mockCobros)
      }
    } catch (error) {
      toast.error('Error al cargar los cobros')
    } finally {
      setLoading(false)
    }
  }

  const fetchProximosCobros = async () => {
    try {
      const hoy = new Date()
      const proximos7Dias = addDays(hoy, 7)
      
      const mockProximos = [
        {
          id: 3,
          nombreCliente: 'Pedro López',
          zona: 'Zona Centro',
          fechaVencimiento: format(addDays(hoy, 1), 'yyyy-MM-dd'),
          saldoPendiente: 400000,
          estado: 'ACTIVO',
          montoCuota: 100000,
          prestamoId: 789,
          telefono: '3001112222'
        },
        {
          id: 4,
          nombreCliente: 'Ana Martínez',
          zona: 'Zona Este',
          fechaVencimiento: format(addDays(hoy, 2), 'yyyy-MM-dd'),
          saldoPendiente: 250000,
          estado: 'ACTIVO',
          montoCuota: 62500,
          prestamoId: 101,
          telefono: '3002223333'
        },
        {
          id: 5,
          nombreCliente: 'Carlos Rodríguez',
          zona: 'Zona Norte',
          fechaVencimiento: format(addDays(hoy, 3), 'yyyy-MM-dd'),
          saldoPendiente: 600000,
          estado: 'ACTIVO',
          montoCuota: 150000,
          prestamoId: 202,
          telefono: '3003334444'
        },
        {
          id: 6,
          nombreCliente: 'Laura Sánchez',
          zona: 'Zona Oeste',
          fechaVencimiento: format(addDays(hoy, 5), 'yyyy-MM-dd'),
          saldoPendiente: 350000,
          estado: 'ACTIVO',
          montoCuota: 87500,
          prestamoId: 303,
          telefono: '3004445555'
        }
      ]
      
      try {
        const response = await axios.get('/api/prestamos/proximos-cobros', {
          params: { dias: 7, zona: filterZona !== 'TODAS' ? filterZona : null }
        })
        setProximosCobros(response.data)
      } catch (e) {
        setProximosCobros(mockProximos)
      }
    } catch (error) {
      console.error('Error al cargar próximos cobros')
    }
  }

  const fetchEventos = async () => {
    try {
      const mockEventos = [
        {
          id: 1,
          titulo: 'Reunión con equipo',
          descripcion: 'Revisión de cobros semanales',
          fecha: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
          hora: '10:00',
          tipo: 'EVENTO',
          color: 'blue'
        },
        {
          id: 2,
          titulo: 'Recordatorio: Revisar morosos',
          descripcion: 'Llamar a clientes con atrasos',
          fecha: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
          hora: '14:00',
          tipo: 'RECORDATORIO',
          color: 'orange'
        }
      ]
      
      try {
        const response = await axios.get('/api/eventos', {
          params: { 
            fechaInicio: format(new Date(), 'yyyy-MM-dd'),
            fechaFin: format(addDays(new Date(), 30), 'yyyy-MM-dd')
          }
        })
        setEventos(response.data)
      } catch (e) {
        setEventos(mockEventos)
      }
    } catch (error) {
      console.error('Error al cargar eventos')
    }
  }

  const fetchZonas = async () => {
    try {
      const mockZonas = ['Zona Norte', 'Zona Sur', 'Zona Centro', 'Zona Este', 'Zona Oeste']
      try {
        const response = await axios.get('/api/prestamos/zonas')
        setZonas(response.data)
      } catch (e) {
        setZonas(mockZonas)
      }
    } catch (error) {
      console.error('Error al cargar zonas')
    }
  }

  const getCobrosPorFecha = (date) => {
    const fechaStr = format(date, 'yyyy-MM-dd')
    return cobros.filter(cobro => format(new Date(cobro.fechaVencimiento), 'yyyy-MM-dd') === fechaStr)
  }

  const getEventosPorFecha = (date) => {
    const fechaStr = format(date, 'yyyy-MM-dd')
    return eventos.filter(evento => format(new Date(evento.fecha), 'yyyy-MM-dd') === fechaStr)
  }

  const handleCrearEvento = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/eventos', eventoForm)
      toast.success('Evento creado exitosamente')
      setShowEventoModal(false)
      setEventoForm({
        titulo: '',
        descripcion: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora: '',
        tipo: 'EVENTO',
        color: 'blue'
      })
      fetchEventos()
    } catch (error) {
      // Demo mode
      toast.success('Evento creado exitosamente')
      setShowEventoModal(false)
      setEventos([...eventos, { id: Date.now(), ...eventoForm }])
      setEventoForm({
        titulo: '',
        descripcion: '',
        fecha: format(new Date(), 'yyyy-MM-dd'),
        hora: '',
        tipo: 'EVENTO',
        color: 'blue'
      })
    }
  }

  const handleEliminarEvento = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await axios.delete(`/api/eventos/${id}`)
        toast.success('Evento eliminado')
        setEventos(eventos.filter(e => e.id !== id))
      } catch (error) {
        toast.success('Evento eliminado')
        setEventos(eventos.filter(e => e.id !== id))
      }
    }
  }

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    }
    return colors[color] || colors.blue
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Calendario de Cobros</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Visualiza y gestiona tus cobros y eventos</p>
        </div>
        <button
          onClick={() => setShowEventoModal(true)}
          className="btn-primary inline-flex items-center space-x-2 h-12 text-sm font-semibold touch-manipulation"
        >
          <Plus size={18} />
          <span>Nuevo Evento</span>
        </button>
      </div>

      {/* Próximos Cobros - Desplegable */}
      <div className="card p-4 sm:p-6">
        <button
          onClick={() => setProximosCobrosExpandido(!proximosCobrosExpandido)}
          className="w-full flex items-center justify-between mb-4 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
        >
          <div className="flex items-center space-x-2">
            <Clock className="text-primary-600" size={20} />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Próximas Visitas</h2>
          </div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
              {proximosCobros.length} {proximosCobros.length === 1 ? 'visita' : 'visitas'}
            </span>
            {proximosCobrosExpandido ? (
              <ChevronUp className="text-gray-400" size={20} />
            ) : (
              <ChevronDown className="text-gray-400" size={20} />
            )}
          </div>
        </button>
        
        {proximosCobrosExpandido && (
          <>
            {proximosCobros.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No hay visitas programadas en los próximos 7 días</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {proximosCobros.map((cobro) => {
                  const diasRestantes = differenceInDays(new Date(cobro.fechaVencimiento), new Date())
                  const esHoy = isToday(new Date(cobro.fechaVencimiento))
                  const esPasado = isPast(new Date(cobro.fechaVencimiento))
                  
                  return (
                    <div
                      key={cobro.id}
                      className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                        esPasado
                          ? 'border-red-200 bg-red-50'
                          : esHoy
                          ? 'border-orange-200 bg-orange-50'
                          : diasRestantes <= 2
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{cobro.nombreCliente}</h3>
                        {esPasado && (
                          <AlertCircle className="text-red-600 flex-shrink-0 ml-2" size={16} />
                        )}
                      </div>
                      
                      <div className="space-y-1.5 mb-2">
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <CalendarIcon size={12} className="mr-1.5 flex-shrink-0" />
                          <span>{format(new Date(cobro.fechaVencimiento), 'dd/MM/yyyy')}</span>
                        </div>
                        
                        <div className="flex items-center text-xs sm:text-sm text-gray-600">
                          <DollarSign size={12} className="mr-1.5 flex-shrink-0" />
                          <span className="font-semibold text-gray-900">${cobro.montoCuota.toLocaleString('es-CO')}</span>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-500">
                          <MapPin size={12} className="mr-1.5 flex-shrink-0" />
                          <span className="truncate">{cobro.zona}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <p className={`text-xs font-medium ${
                          esPasado
                            ? 'text-red-700'
                            : esHoy
                            ? 'text-orange-700'
                            : diasRestantes <= 2
                            ? 'text-yellow-700'
                            : 'text-green-700'
                        }`}>
                          {esPasado 
                            ? '⚠️ Vencido' 
                            : esHoy 
                            ? '📅 Hoy' 
                            : diasRestantes === 1
                            ? '⏰ Mañana'
                            : `${diasRestantes} días restantes`}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="card p-4 sm:p-6">
            <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Calendario</h2>
              <div className="flex items-center space-x-2">
                <Filter size={18} className="text-gray-600" />
                <select
                  value={filterZona}
                  onChange={(e) => setFilterZona(e.target.value)}
                  className="input-field h-12 sm:h-auto text-sm sm:text-base"
                >
                  <option value="TODAS">Todas las zonas</option>
                  {zonas.map((zona) => (
                    <option key={zona} value={zona}>{zona}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="react-calendar-wrapper">
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-0"
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const cobrosFecha = getCobrosPorFecha(date)
                    const eventosFecha = getEventosPorFecha(date)
                    const hasCobros = cobrosFecha.length > 0
                    const hasEventos = eventosFecha.length > 0
                    
                    if (hasCobros || hasEventos) {
                      return (
                        <div className="flex justify-center items-center gap-1 mt-1">
                          {hasCobros && (
                            <div className="w-2 h-2 bg-green-600 rounded-full" title={`${cobrosFecha.length} cobro(s)`}></div>
                          )}
                          {hasEventos && (
                            <div className={`w-2 h-2 rounded-full ${
                              eventosFecha[0].color === 'blue' ? 'bg-blue-600' :
                              eventosFecha[0].color === 'green' ? 'bg-green-600' :
                              eventosFecha[0].color === 'orange' ? 'bg-orange-600' :
                              eventosFecha[0].color === 'purple' ? 'bg-purple-600' :
                              'bg-red-600'
                            }`} title={`${eventosFecha.length} evento(s)`}></div>
                          )}
                        </div>
                      )
                    }
                  }
                  return null
                }}
              />
            </div>

            <style>{`
              .react-calendar-wrapper .react-calendar {
                width: 100%;
                border: none;
                font-family: inherit;
              }
              .react-calendar-wrapper .react-calendar__tile--active {
                background: rgb(14, 165, 233);
                color: white;
              }
              .react-calendar-wrapper .react-calendar__tile--now {
                background: rgb(224, 242, 254);
              }
              .react-calendar-wrapper .react-calendar__tile {
                height: 60px;
                padding: 4px;
              }
            `}</style>
          </div>
        </div>

        {/* Cobros y Eventos del día seleccionado */}
        <div className="lg:col-span-1 space-y-4">
          {/* Cobros del día */}
          <div className="card p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Cobros del {format(selectedDate, 'dd/MM/yyyy')}
            </h2>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : cobros.length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No hay cobros para esta fecha</p>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {cobros.map((cobro) => (
                  <div
                    key={cobro.id}
                    className={`p-3 sm:p-4 border-2 rounded-lg transition-all ${
                      cobro.estado === 'VENCIDO'
                        ? 'border-red-200 bg-red-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{cobro.nombreCliente}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
                        cobro.estado === 'VENCIDO'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {cobro.estado}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs sm:text-sm text-gray-600 mb-3">
                      <div className="flex items-center">
                        <DollarSign size={14} className="mr-1.5 flex-shrink-0" />
                        <span>Monto: <strong className="text-gray-900">${cobro.montoCuota.toLocaleString('es-CO')}</strong></span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-1.5 flex-shrink-0" />
                        <span>{cobro.zona}</span>
                      </div>
                      <div className="flex items-center">
                        <User size={14} className="mr-1.5 flex-shrink-0" />
                        <span>Pendiente: <strong className="text-orange-600">${cobro.saldoPendiente.toLocaleString('es-CO')}</strong></span>
                      </div>
                    </div>

                    <button className="w-full text-xs sm:text-sm btn-primary py-2 touch-manipulation">
                      Registrar Abono
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eventos del día */}
          <div className="card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Eventos del {format(selectedDate, 'dd/MM/yyyy')}
              </h2>
              <button
                onClick={() => {
                  setEventoForm({ ...eventoForm, fecha: format(selectedDate, 'yyyy-MM-dd') })
                  setShowEventoModal(true)
                }}
                className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors touch-manipulation"
                title="Agregar evento"
              >
                <Plus size={18} />
              </button>
            </div>

            {getEventosPorFecha(selectedDate).length === 0 ? (
              <p className="text-gray-500 text-center py-8 text-sm">No hay eventos para esta fecha</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {getEventosPorFecha(selectedDate).map((evento) => (
                  <div
                    key={evento.id}
                    className={`p-3 border-2 rounded-lg ${getColorClass(evento.color)}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-sm sm:text-base">{evento.titulo}</h3>
                      <button
                        onClick={() => handleEliminarEvento(evento.id)}
                        className="p-1 text-red-600 hover:bg-red-200 rounded transition-colors touch-manipulation flex-shrink-0"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    {evento.descripcion && (
                      <p className="text-xs sm:text-sm mb-2 opacity-90">{evento.descripcion}</p>
                    )}
                    {evento.hora && (
                      <div className="flex items-center text-xs opacity-80">
                        <Clock size={12} className="mr-1" />
                        <span>{evento.hora}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Nuevo Evento */}
      {showEventoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-t-3xl sm:rounded-xl max-w-md w-full p-4 sm:p-6 my-0 sm:my-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="text-primary-600" size={20} />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Nuevo Evento</h2>
              </div>
              <button
                onClick={() => setShowEventoModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 active:bg-gray-100 rounded-lg transition-colors touch-manipulation"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCrearEvento} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={eventoForm.titulo}
                  onChange={(e) => setEventoForm({ ...eventoForm, titulo: e.target.value })}
                  className="input-field h-12 text-base"
                  required
                  placeholder="Ej: Reunión con equipo, Recordatorio..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  value={eventoForm.descripcion}
                  onChange={(e) => setEventoForm({ ...eventoForm, descripcion: e.target.value })}
                  className="input-field text-base min-h-[80px]"
                  rows="3"
                  placeholder="Detalles del evento..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={eventoForm.fecha}
                    onChange={(e) => setEventoForm({ ...eventoForm, fecha: e.target.value })}
                    className="input-field h-12 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={eventoForm.hora}
                    onChange={(e) => setEventoForm({ ...eventoForm, hora: e.target.value })}
                    className="input-field h-12 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Tipo
                </label>
                <select
                  value={eventoForm.tipo}
                  onChange={(e) => setEventoForm({ ...eventoForm, tipo: e.target.value })}
                  className="input-field h-12 text-base"
                >
                  <option value="EVENTO">Evento</option>
                  <option value="RECORDATORIO">Recordatorio</option>
                  <option value="REUNION">Reunión</option>
                  <option value="TAREA">Tarea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {['blue', 'green', 'orange', 'purple', 'red'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEventoForm({ ...eventoForm, color })}
                      className={`h-12 rounded-lg border-2 transition-all touch-manipulation ${
                        eventoForm.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'green' ? 'bg-green-500' :
                        color === 'orange' ? 'bg-orange-500' :
                        color === 'purple' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowEventoModal(false)}
                  className="btn-secondary h-12 text-base touch-manipulation"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary h-12 text-base touch-manipulation inline-flex items-center space-x-2"
                >
                  <CheckCircle size={18} />
                  <span>Crear Evento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

