import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, Search, Filter, DollarSign, Calendar, MapPin, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { prestamosService } from '../services/prestamosService'
import api from '../utils/api'

export default function Prestamos() {
  const { user } = useAuth()
  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('TODOS')
  const [searchParams] = useSearchParams()
  const [showRutaModal, setShowRutaModal] = useState(false)
  const [rutaForm, setRutaForm] = useState({
    nombre: '',
    color: '#3B82F6' // Azul por defecto
  })

  useEffect(() => {
    const estadoParam = searchParams.get('estado')
    if (estadoParam) {
      setFilterEstado(estadoParam)
    }
    if (user) {
      fetchPrestamos()
    }
  }, [searchParams, user])

  const fetchPrestamos = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const filters = {
        estado: filterEstado,
        search: searchTerm
      }
      const data = await prestamosService.getPrestamos(user.id, filters)
      setPrestamos(data)
    } catch (error) {
      console.error('Error fetching prestamos:', error)
      toast.error('Error al cargar los préstamos')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      ACTIVO: 'bg-green-100 text-green-800 border-green-200',
      VENCIDO: 'bg-red-100 text-red-800 border-red-200',
      FINALIZADO: 'bg-gray-100 text-gray-800 border-gray-200',
      INCOBRABLE: 'bg-orange-100 text-orange-800 border-orange-200'
    }
    return badges[estado] || badges.ACTIVO
  }

  const handleCrearRuta = async (e) => {
    e.preventDefault()
    
    if (!rutaForm.nombre.trim()) {
      toast.error('El nombre de la ruta es requerido')
      return
    }

    try {
      await api.post('/rutas', {
        nombre: rutaForm.nombre.trim(),
        color: rutaForm.color
      })
      
      toast.success(`Ruta "${rutaForm.nombre}" creada exitosamente`)
      setShowRutaModal(false)
      setRutaForm({ nombre: '', color: '#3B82F6' })
    } catch (error) {
      console.error('Error al crear ruta:', error)
      toast.error(error.response?.data?.message || 'Error al crear la ruta')
    }
  }

  const coloresDisponibles = [
    { nombre: 'Azul', valor: '#3B82F6' },
    { nombre: 'Verde', valor: '#10B981' },
    { nombre: 'Rojo', valor: '#EF4444' },
    { nombre: 'Amarillo', valor: '#F59E0B' },
    { nombre: 'Morado', valor: '#8B5CF6' },
    { nombre: 'Rosa', valor: '#EC4899' },
    { nombre: 'Naranja', valor: '#F97316' },
    { nombre: 'Cian', valor: '#06B6D4' },
  ]

  const filteredPrestamos = prestamos.filter(prestamo => {
    const matchesSearch = prestamo.nombreCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prestamo.telefono.includes(searchTerm) ||
                         prestamo.zona.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'TODOS' || prestamo.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus préstamos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRutaModal(true)}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <MapPin size={20} />
            <span>Crear Ruta</span>
          </button>
          <Link
            to="/prestamos/nuevo"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nuevo Préstamo</span>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono o zona..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="input-field"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="ACTIVO">Activos</option>
              <option value="VENCIDO">Vencidos</option>
              <option value="FINALIZADO">Finalizados</option>
              <option value="INCOBRABLE">Incobrables</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prestamos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPrestamos.map((prestamo) => (
          <Link
            key={prestamo.id}
            to={`/prestamos/${prestamo.id}`}
            className="card hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {prestamo.nombreCliente}
                </h3>
                <p className="text-sm text-gray-600">{prestamo.telefono}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(prestamo.estado)}`}>
                {prestamo.estado}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign size={16} className="mr-2" />
                <span>Monto: <strong className="text-gray-900">${prestamo.montoPrestado.toLocaleString('es-CO')}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign size={16} className="mr-2" />
                <span>Pendiente: <strong className="text-orange-600">${prestamo.saldoPendiente.toLocaleString('es-CO')}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar size={16} className="mr-2" />
                <span>Vence: <strong className="text-gray-900">{new Date(prestamo.fechaVencimiento).toLocaleDateString('es-CO')}</strong></span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin size={16} className="mr-2" />
                <span>{prestamo.zona}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Cuotas: {prestamo.cuotasPagadas}/{prestamo.numeroCuotas}</span>
                <span className="text-primary-600 font-medium">Ver detalles →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredPrestamos.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No se encontraron préstamos</p>
          <Link to="/prestamos/nuevo" className="text-primary-600 hover:text-primary-700 font-medium mt-2 inline-block">
            Crear tu primer préstamo
          </Link>
        </div>
      )}

      {/* Modal Crear Ruta */}
      {showRutaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Crear nueva ruta</h2>
              <button
                onClick={() => {
                  setShowRutaModal(false)
                  setRutaForm({ nombre: '', color: '#3B82F6' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCrearRuta} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la ruta
                  </label>
                  <input
                    type="text"
                    value={rutaForm.nombre}
                    onChange={(e) => setRutaForm({ ...rutaForm, nombre: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ej. Ruta 1"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {coloresDisponibles.map((color) => (
                      <button
                        key={color.valor}
                        type="button"
                        onClick={() => setRutaForm({ ...rutaForm, color: color.valor })}
                        className={`
                          w-full h-12 rounded-lg border-2 transition-all
                          ${rutaForm.color === color.valor 
                            ? 'border-gray-900 ring-2 ring-offset-2 ring-gray-300' 
                            : 'border-gray-200 hover:border-gray-300'
                          }
                        `}
                        style={{ backgroundColor: color.valor }}
                        title={color.nombre}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="color"
                      value={rutaForm.color}
                      onChange={(e) => setRutaForm({ ...rutaForm, color: e.target.value })}
                      className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">O elige un color personalizado</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowRutaModal(false)
                    setRutaForm({ nombre: '', color: '#3B82F6' })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

