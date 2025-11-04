import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ArrowLeft, User, Phone, MapPin, DollarSign, FileText, Calendar, Plus } from 'lucide-react'

export default function DetalleCliente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cliente, setCliente] = useState(null)
  const [prestamos, setPrestamos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCliente()
    fetchPrestamos()
  }, [id])

  const fetchCliente = async () => {
    try {
      const mockCliente = {
        id: parseInt(id),
        nombre: 'Juan Pérez',
        telefono: '3001234567',
        direccion: 'Calle 123 #45-67',
        zona: 'Zona Norte',
        email: 'juan.perez@email.com',
        fechaRegistro: '2024-01-15',
        totalPrestamos: 2,
        prestamosActivos: 1,
        totalPrestado: 3000000,
        saldoPendiente: 1500000,
        totalCobrado: 1500000
      }

      try {
        const response = await axios.get(`/api/clientes/${id}`)
        setCliente(response.data)
      } catch (e) {
        setCliente(mockCliente)
      }
    } catch (error) {
      toast.error('Error al cargar el cliente')
    } finally {
      setLoading(false)
    }
  }

  const fetchPrestamos = async () => {
    try {
      const mockPrestamos = [
        {
          id: 1,
          montoPrestado: 2000000,
          saldoPendiente: 1000000,
          numeroCuotas: 12,
          cuotasPagadas: 6,
          fechaInicio: '2024-01-15',
          fechaVencimiento: '2024-12-15',
          estado: 'ACTIVO',
          frecuenciaPago: 'MENSUAL'
        },
        {
          id: 2,
          montoPrestado: 1000000,
          saldoPendiente: 0,
          numeroCuotas: 6,
          cuotasPagadas: 6,
          fechaInicio: '2023-06-01',
          fechaVencimiento: '2023-11-01',
          estado: 'FINALIZADO',
          frecuenciaPago: 'MENSUAL'
        }
      ]

      try {
        const response = await axios.get(`/api/clientes/${id}/prestamos`)
        setPrestamos(response.data)
      } catch (e) {
        setPrestamos(mockPrestamos)
      }
    } catch (error) {
      console.error('Error al cargar préstamos')
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Cliente no encontrado</p>
        <Link to="/clientes" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Volver a clientes
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/clientes" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{cliente.nombre}</h1>
          <p className="text-gray-600 mt-1">Detalles del cliente</p>
        </div>
        <Link
          to={`/prestamos/nuevo?cliente=${cliente.id}`}
          className="btn-primary inline-flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Nuevo Préstamo</span>
        </Link>
      </div>

      {/* Información del Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Personal</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <User size={18} className="mr-2" />
              <span>{cliente.nombre}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Phone size={18} className="mr-2" />
              <span>{cliente.telefono}</span>
            </div>
            {cliente.email && (
              <div className="flex items-center text-gray-600">
                <span className="mr-2">📧</span>
                <span>{cliente.email}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2" />
              <span>{cliente.direccion}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2" />
              <span>Zona: {cliente.zona}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={18} className="mr-2" />
              <span>Cliente desde: {new Date(cliente.fechaRegistro).toLocaleDateString('es-CO')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen Financiero</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Préstamos:</span>
              <span className="font-semibold text-gray-900">
                {cliente.totalPrestamos} ({cliente.prestamosActivos} activos)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Prestado:</span>
              <span className="font-semibold text-gray-900">
                ${cliente.totalPrestado?.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Total Cobrado:</span>
              <span className="font-semibold text-green-600">
                ${cliente.totalCobrado?.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Saldo Pendiente:</span>
              <span className="font-semibold text-orange-600">
                ${cliente.saldoPendiente?.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progreso de Pago</span>
                <span className="text-sm font-medium text-gray-900">
                  {cliente.totalPrestado > 0 
                    ? Math.round(((cliente.totalPrestado - cliente.saldoPendiente) / cliente.totalPrestado) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ 
                    width: `${cliente.totalPrestado > 0 
                      ? ((cliente.totalPrestado - cliente.saldoPendiente) / cliente.totalPrestado) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Préstamos del Cliente */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Préstamos</h2>
          <Link
            to={`/prestamos/nuevo?cliente=${cliente.id}`}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            + Agregar Préstamo
          </Link>
        </div>

        {prestamos.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">Este cliente no tiene préstamos</p>
            <Link
              to={`/prestamos/nuevo?cliente=${cliente.id}`}
              className="mt-4 text-primary-600 hover:text-primary-700 font-medium inline-block"
            >
              Crear primer préstamo
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuotas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {prestamos.map((prestamo) => (
                  <tr key={prestamo.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${prestamo.montoPrestado?.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600">
                      ${prestamo.saldoPendiente?.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {prestamo.cuotasPagadas}/{prestamo.numeroCuotas}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(prestamo.fechaVencimiento).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getEstadoBadge(prestamo.estado)}`}>
                        {prestamo.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <Link
                        to={`/prestamos/${prestamo.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

