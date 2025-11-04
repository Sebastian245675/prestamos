import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Search, User, Phone, MapPin, DollarSign, FileText, Plus, Filter, List, Grid } from 'lucide-react'

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterZona, setFilterZona] = useState('TODAS')
  const [zonas, setZonas] = useState([])
  const [vistaAgenda, setVistaAgenda] = useState(false)

  useEffect(() => {
    fetchClientes()
    fetchZonas()
  }, [])

  const fetchClientes = async () => {
    try {
      const mockClientes = [
        {
          id: 1,
          nombre: 'Juan Pérez',
          telefono: '3001234567',
          direccion: 'Calle 123 #45-67',
          zona: 'Zona Norte',
          email: 'juan.perez@email.com',
          totalPrestamos: 2,
          prestamosActivos: 1,
          totalPrestado: 3000000,
          saldoPendiente: 1500000,
          ultimaActividad: '2024-03-15'
        },
        {
          id: 2,
          nombre: 'María García',
          telefono: '3002345678',
          direccion: 'Carrera 45 #12-34',
          zona: 'Zona Sur',
          email: 'maria.garcia@email.com',
          totalPrestamos: 1,
          prestamosActivos: 1,
          totalPrestado: 2000000,
          saldoPendiente: 2000000,
          ultimaActividad: '2024-03-14'
        },
        {
          id: 3,
          nombre: 'Carlos López',
          telefono: '3003456789',
          direccion: 'Avenida 56 #78-90',
          zona: 'Zona Centro',
          email: 'carlos.lopez@email.com',
          totalPrestamos: 3,
          prestamosActivos: 0,
          totalPrestado: 5000000,
          saldoPendiente: 0,
          ultimaActividad: '2024-03-10'
        },
        {
          id: 4,
          nombre: 'Ana Martínez',
          telefono: '3004567890',
          direccion: 'Calle 78 #90-12',
          zona: 'Zona Este',
          email: 'ana.martinez@email.com',
          totalPrestamos: 1,
          prestamosActivos: 1,
          totalPrestado: 1500000,
          saldoPendiente: 800000,
          ultimaActividad: '2024-03-13'
        }
      ]

      try {
        const response = await axios.get('/api/clientes')
        setClientes(response.data)
      } catch (e) {
        setClientes(mockClientes)
      }
    } catch (error) {
      toast.error('Error al cargar los clientes')
    } finally {
      setLoading(false)
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

  const filteredClientes = clientes.filter(cliente => {
    const matchesSearch = 
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefono.includes(searchTerm) ||
      cliente.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.direccion.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesZona = filterZona === 'TODAS' || cliente.zona === filterZona
    
    return matchesSearch && matchesZona
  })

  // Ordenar clientes alfabéticamente para la vista de agenda
  const clientesOrdenados = [...filteredClientes].sort((a, b) => 
    a.nombre.localeCompare(b.nombre)
  )

  // Agrupar por letra inicial para la vista de agenda
  const clientesPorLetra = clientesOrdenados.reduce((acc, cliente) => {
    const letra = cliente.nombre.charAt(0).toUpperCase()
    if (!acc[letra]) {
      acc[letra] = []
    }
    acc[letra].push(cliente)
    return acc
  }, {})

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
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gestiona tu base de clientes</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setVistaAgenda(false)}
              className={`p-2 rounded transition-colors ${
                !vistaAgenda 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de tarjetas"
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setVistaAgenda(true)}
              className={`p-2 rounded transition-colors ${
                vistaAgenda 
                  ? 'bg-white text-primary-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Vista de agenda"
            >
              <List size={20} />
            </button>
          </div>
          <Link
            to="/prestamos/nuevo"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Nuevo Cliente</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{clientes.length}</p>
            </div>
            <User className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Clientes Activos</p>
              <p className="text-2xl font-bold text-gray-900">
                {clientes.filter(c => c.prestamosActivos > 0).length}
              </p>
            </div>
            <FileText className="text-green-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Prestado</p>
              <p className="text-2xl font-bold text-gray-900">
                ${clientes.reduce((sum, c) => sum + c.totalPrestado, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="text-purple-600" size={32} />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Saldo Pendiente</p>
              <p className="text-2xl font-bold text-gray-900">
                ${clientes.reduce((sum, c) => sum + c.saldoPendiente, 0).toLocaleString('es-CO')}
              </p>
            </div>
            <DollarSign className="text-orange-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, teléfono, email o dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-600" />
            <select
              value={filterZona}
              onChange={(e) => setFilterZona(e.target.value)}
              className="input-field"
            >
              <option value="TODAS">Todas las zonas</option>
              {zonas.map((zona) => (
                <option key={zona} value={zona}>{zona}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Vista de Tarjetas */}
      {!vistaAgenda && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="text-primary-600" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{cliente.nombre}</h3>
                    <p className="text-sm text-gray-600">{cliente.email || 'Sin email'}</p>
                  </div>
                </div>
                {cliente.prestamosActivos > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                    Activo
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{cliente.telefono}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>{cliente.direccion}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  <span>Zona: {cliente.zona}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Préstamos:</span>
                  <span className="font-medium text-gray-900">
                    {cliente.totalPrestamos} total / {cliente.prestamosActivos} activos
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Prestado:</span>
                  <span className="font-medium text-gray-900">
                    ${cliente.totalPrestado?.toLocaleString('es-CO')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Saldo Pendiente:</span>
                  <span className="font-medium text-orange-600">
                    ${cliente.saldoPendiente?.toLocaleString('es-CO')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  to={`/clientes/${cliente.id}`}
                  className="w-full btn-primary text-center inline-block py-2"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vista de Agenda */}
      {vistaAgenda && (
        <div className="card p-0">
          <div className="divide-y divide-gray-200">
            {Object.keys(clientesPorLetra).sort().map((letra) => (
              <div key={letra}>
                {/* Header de letra */}
                <div className="bg-gray-50 px-4 py-2 sticky top-0 z-10">
                  <h3 className="text-sm font-bold text-gray-700 uppercase">{letra}</h3>
                </div>
                {/* Lista de contactos */}
                {clientesPorLetra[letra].map((cliente) => (
                  <Link
                    key={cliente.id}
                    to={`/clientes/${cliente.id}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 font-semibold text-sm">
                          {cliente.nombre.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-medium text-gray-900 truncate">
                          {cliente.nombre}
                        </p>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <Phone size={14} className="text-gray-400 flex-shrink-0" />
                          <p className="text-sm text-gray-600 truncate">{cliente.telefono}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredClientes.length === 0 && (
        <div className="card text-center py-12">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 text-lg">No se encontraron clientes</p>
          <Link
            to="/prestamos/nuevo"
            className="mt-4 text-primary-600 hover:text-primary-700 font-medium inline-block"
          >
            Crear tu primer cliente
          </Link>
        </div>
      )}
    </div>
  )
}

