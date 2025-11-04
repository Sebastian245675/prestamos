import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { Download, FileText, FileSpreadsheet, Calendar, TrendingUp } from 'lucide-react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function Reportes() {
  const { user } = useAuth()
  const [reportes, setReportes] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    if (user) {
      fetchReportes()
    }
  }, [fechaInicio, fechaFin, user])

  const fetchReportes = async () => {
    if (!user?.id) return
    
    try {
      setLoading(true)
      const params = {}
      if (fechaInicio) params.fechaInicio = fechaInicio
      if (fechaFin) params.fechaFin = fechaFin
      
      const response = await api.get('/reportes', { params })
      setReportes(response.data)
    } catch (error) {
      console.error('Error al cargar los reportes:', error)
      toast.error('Error al cargar los reportes')
      setReportes(null)
    } finally {
      setLoading(false)
    }
  }

  const exportarPDF = async () => {
    try {
      toast.info('La exportación a PDF estará disponible próximamente')
      // TODO: Implementar cuando el backend tenga el endpoint
      // const response = await api.get('/reportes/exportar/pdf', {
      //   params: { fechaInicio, fechaFin },
      //   responseType: 'blob'
      // })
    } catch (error) {
      toast.error('Error al exportar PDF')
    }
  }

  const exportarExcel = async () => {
    try {
      toast.info('La exportación a Excel estará disponible próximamente')
      // TODO: Implementar cuando el backend tenga el endpoint
      // const response = await api.get('/reportes/exportar/excel', {
      //   params: { fechaInicio, fechaFin },
      //   responseType: 'blob'
      // })
    } catch (error) {
      toast.error('Error al exportar Excel')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 mt-1">Análisis detallado de tu actividad</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <button
            onClick={exportarPDF}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <FileText size={18} />
            <span>PDF</span>
          </button>
          <button
            onClick={exportarExcel}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <FileSpreadsheet size={18} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filtros de fecha */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Calendar size={20} className="text-gray-600" />
          <div className="flex items-center space-x-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="input-field"
              />
            </div>
            <button
              onClick={fetchReportes}
              className="btn-primary mt-6"
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {reportes && (
        <>
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Prestado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportes.totalPrestado?.toLocaleString('es-CO') || 0}
                  </p>
                </div>
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cobrado</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportes.totalCobrado?.toLocaleString('es-CO') || 0}
                  </p>
                </div>
                <TrendingUp className="text-green-600" size={32} />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Pendiente</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportes.totalPendiente?.toLocaleString('es-CO') || 0}
                  </p>
                </div>
                <TrendingUp className="text-yellow-600" size={32} />
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Perdido</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${reportes.totalPerdido?.toLocaleString('es-CO') || 0}
                  </p>
                </div>
                <TrendingUp className="text-red-600" size={32} />
              </div>
            </div>
          </div>

          {/* Ganancias */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Ganancias</h2>
            <div className="text-center py-8">
              <p className="text-4xl font-bold text-primary-600">
                ${(reportes.totalCobrado - reportes.totalPrestado)?.toLocaleString('es-CO') || 0}
              </p>
              <p className="text-gray-600 mt-2">Ganancias totales (intereses)</p>
            </div>
          </div>

          {/* Gráficos */}
          {reportes.porZona && reportes.porZona.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Productividad por Zona</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportes.porZona}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zona" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="prestado" fill="#0ea5e9" name="Prestado" />
                  <Bar dataKey="cobrado" fill="#10b981" name="Cobrado" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {reportes.porPeriodo && reportes.porPeriodo.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Evolución Temporal</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportes.porPeriodo}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="prestado" stroke="#0ea5e9" name="Prestado" />
                  <Line type="monotone" dataKey="cobrado" stroke="#10b981" name="Cobrado" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Productividad por Cobrador */}
          {reportes.porCobrador && reportes.porCobrador.length > 0 && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Productividad por Cobrador</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cobrador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Cobrado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Préstamos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Eficiencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportes.porCobrador.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.cobrador}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.totalCobrado?.toLocaleString('es-CO') || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.numeroPrestamos || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.eficiencia ? `${item.eficiencia}%` : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

