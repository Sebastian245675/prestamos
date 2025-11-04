import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { DollarSign, Calendar, CheckCircle, Clock, AlertCircle, FileText } from 'lucide-react'

export default function ClientePortal() {
  const { id } = useParams()
  const [prestamo, setPrestamo] = useState(null)
  const [cuotas, setCuotas] = useState([])
  const [abonos, setAbonos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrestamoData()
  }, [id])

  const fetchPrestamoData = async () => {
    try {
      const [prestamoRes, cuotasRes, abonosRes] = await Promise.all([
        axios.get(`/api/public/prestamos/${id}`),
        axios.get(`/api/public/prestamos/${id}/cuotas`),
        axios.get(`/api/public/prestamos/${id}/abonos`)
      ])
      setPrestamo(prestamoRes.data)
      setCuotas(cuotasRes.data)
      setAbonos(abonosRes.data)
    } catch (error) {
      toast.error('Error al cargar la información del préstamo')
    } finally {
      setLoading(false)
    }
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      ACTIVO: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'Activo' },
      VENCIDO: { bg: 'bg-red-100', text: 'text-red-800', icon: AlertCircle, label: 'Vencido' },
      FINALIZADO: { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle, label: 'Finalizado' },
      INCOBRABLE: { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertCircle, label: 'Incobrable' }
    }
    return badges[estado] || badges.ACTIVO
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!prestamo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Préstamo no encontrado</h1>
          <p className="text-gray-600">El préstamo que buscas no existe o no tienes acceso a él.</p>
        </div>
      </div>
    )
  }

  const estadoBadge = getEstadoBadge(prestamo.estado)
  const IconEstado = estadoBadge.icon

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal del Cliente</h1>
          <p className="text-gray-600">Consulta el estado de tu préstamo</p>
        </div>

        {/* Estado del Préstamo */}
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Estado del Préstamo</h2>
            <span className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${estadoBadge.bg} ${estadoBadge.text}`}>
              <IconEstado size={16} />
              <span>{estadoBadge.label}</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="text-primary-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Monto Prestado</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${prestamo.montoPrestado?.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Saldo Pendiente</p>
                <p className="text-lg font-semibold text-orange-600">
                  ${prestamo.saldoPendiente?.toLocaleString('es-CO')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Fecha de Inicio</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(prestamo.fechaInicio).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(prestamo.fechaVencimiento).toLocaleDateString('es-CO')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Progreso de Pago</span>
              <span className="text-sm font-medium text-gray-900">
                {prestamo.cuotasPagadas} / {prestamo.numeroCuotas} cuotas
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${(prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Cuotas */}
        <div className="card mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuotas</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cuota #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimiento
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Pago
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cuotas.map((cuota) => (
                  <tr key={cuota.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cuota.numeroCuota}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      ${cuota.monto?.toLocaleString('es-CO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(cuota.fechaVencimiento).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        cuota.estado === 'PAGADA'
                          ? 'bg-green-100 text-green-800'
                          : cuota.estado === 'VENCIDA'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {cuota.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {cuota.fechaPago ? new Date(cuota.fechaPago).toLocaleDateString('es-CO') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Historial de Abonos */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Historial de Abonos</h2>
          {abonos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay abonos registrados</p>
          ) : (
            <div className="space-y-3">
              {abonos.map((abono) => (
                <div
                  key={abono.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="text-primary-600" size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        ${abono.monto?.toLocaleString('es-CO')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(abono.fechaAbono).toLocaleDateString('es-CO')}
                      </p>
                    </div>
                  </div>
                  {abono.observaciones && (
                    <p className="text-sm text-gray-600">{abono.observaciones}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

