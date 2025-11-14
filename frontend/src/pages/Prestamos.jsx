import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Plus, Search, Filter, DollarSign, Calendar, MapPin, X, Download } from 'lucide-react'
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

  const exportarPrestamosPorEstado = async () => {
    const prestamosPorEstado = filteredPrestamos.filter(p => filterEstado === 'TODOS' || p.estado === filterEstado)

    if (prestamosPorEstado.length === 0) {
      toast.info('No hay préstamos para exportar en este estado')
      return
    }

    try {
      const jspdfModule = await import('jspdf')
      const jsPDFClass = jspdfModule.jsPDF || (jspdfModule.default && (jspdfModule.default.jsPDF || jspdfModule.default)) || jspdfModule.default

      if (!jsPDFClass) {
        throw new Error('MODULE_NOT_FOUND')
      }

      const doc = new jsPDFClass({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const marginX = 14
      const marginY = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      const contentWidth = pageWidth - marginX * 2
      const lineHeight = 4.2

      const estadoTitulo = filterEstado === 'TODOS' ? 'Todos los estados' : filterEstado
      const generadoPor = user?.nombreCompleto || user?.email || 'Usuario no identificado'

      const drawHeader = () => {
        doc.setFillColor(23, 37, 84)
        doc.rect(marginX, marginY - 22, contentWidth, 30, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(22)
        doc.text('REPORTE DE PRÉSTAMOS', marginX + 10, marginY - 10)

        doc.setFont('helvetica', 'medium')
        doc.setFontSize(12)
        doc.text(`Estado: ${estadoTitulo}`, marginX + 10, marginY - 4)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(10)
        const headerInfo = [
          `Generado: ${new Date().toLocaleDateString('es-CO')}`,
          `Generado por: ${generadoPor}`,
          `Total registros: ${prestamosPorEstado.length}`
        ]

        headerInfo.forEach((text, idx) => {
          doc.text(text, pageWidth - marginX - 10, marginY - 12 + (idx * 6), { align: 'right' })
        })

        doc.setDrawColor(148, 163, 184)
        doc.setLineWidth(0.5)
        doc.line(marginX, marginY + 7, marginX + contentWidth, marginY + 7)
      }

      const columns = [
        { title: 'Cliente', width: 42, align: 'left' },
        { title: 'Préstamo', width: 30, align: 'right' },
        { title: 'Saldo', width: 30, align: 'right' },
        { title: 'Cuotas', width: 28, align: 'center' },
        { title: 'Frecuencia', width: 32, align: 'left' },
        { title: 'Zona', width: 28, align: 'left' },
        { title: 'Vencimiento', width: 32, align: 'left' },
        { title: 'Estado', width: 32, align: 'left' }
      ]

      let currentX = marginX
      columns.forEach((col) => {
        col.x = currentX
        currentX += col.width
      })

      const drawTableHeader = (startY) => {
        doc.setFillColor(226, 232, 240)
        doc.rect(marginX, startY - 7, currentX - marginX, 9, 'F')
        doc.setDrawColor(203, 213, 225)
        doc.rect(marginX, startY - 7, currentX - marginX, 9)
        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)

        columns.forEach((col, idx) => {
          const textX = col.align === 'right'
            ? col.x + col.width - 2
            : col.align === 'center'
              ? col.x + col.width / 2
              : col.x + 2
          const options = col.align === 'right'
            ? { align: 'right' }
            : col.align === 'center'
              ? { align: 'center' }
              : undefined
          doc.text(col.title.toUpperCase(), textX, startY - 1.5, options)

          if (idx < columns.length - 1) {
            const nextX = col.x + col.width
            doc.line(nextX, startY - 7, nextX, startY + 2)
          }
        })
      }

      const getRowData = (prestamo) => ([
        `${prestamo.nombreCliente}\n${prestamo.telefono}`,
        `$${prestamo.montoPrestado.toLocaleString('es-CO')}`,
        `$${prestamo.saldoPendiente.toLocaleString('es-CO')}`,
        `${prestamo.cuotasPagadas}/${prestamo.numeroCuotas}`,
        prestamo.frecuenciaPago,
        prestamo.zona || 'Sin zona',
        new Date(prestamo.fechaVencimiento).toLocaleDateString('es-CO'),
        prestamo.estado
      ])

      const drawSummary = (startY) => {
        const totalMonto = prestamosPorEstado.reduce((sum, p) => sum + p.montoPrestado, 0)
        const totalSaldo = prestamosPorEstado.reduce((sum, p) => sum + p.saldoPendiente, 0)

        const cards = [
          { label: 'Préstamos listados', value: prestamosPorEstado.length },
          { label: 'Total prestado', value: totalMonto },
          { label: 'Saldo pendiente', value: totalSaldo }
        ]

        const cardWidth = (contentWidth - 10) / cards.length

        cards.forEach((card, idx) => {
          const x = marginX + idx * (cardWidth + 5)
          doc.setFillColor(255, 255, 255)
          doc.roundedRect(x, startY, cardWidth, 28, 3, 3, 'F')
          doc.setDrawColor(226, 232, 240)
          doc.roundedRect(x, startY, cardWidth, 28, 3, 3)

          doc.setFillColor(226, 232, 240)
          doc.roundedRect(x, startY, cardWidth, 10, 3, 3, 'F')

          doc.setTextColor(15, 23, 42)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(9.5)
          doc.text(card.label.toUpperCase(), x + 4, startY + 6)

          doc.setTextColor(30, 41, 59)
          doc.setFont('helvetica', 'bold')

          if (typeof card.value === 'number') {
            const text = `$${card.value.toLocaleString('es-CO')}`
            doc.setFontSize(13)
            const lines = doc.splitTextToSize(text, cardWidth - 8)
            lines.forEach((line, lineIdx) => {
              doc.text(line, x + 4, startY + 18 + (lineIdx * 6))
            })
          } else {
            doc.setFontSize(14)
            doc.text(String(card.value), x + 4, startY + 18)
          }
        })

        return startY + 38
      }

      drawHeader()

      let currentY = drawSummary(marginY + 6)
      currentY += 10
      drawTableHeader(currentY)
      currentY += 4

      prestamosPorEstado.forEach((prestamo, index) => {
        const rowValues = getRowData(prestamo).map((value, idx) =>
          doc.splitTextToSize(String(value), columns[idx].width - 4)
        )

        const rowHeight = Math.max(...rowValues.map((lines) => lines.length)) * lineHeight + 1.5

        if (currentY + rowHeight > pageHeight - marginY) {
          doc.addPage()
          drawHeader()
          currentY = drawSummary(marginY + 6)
          currentY += 10
          drawTableHeader(currentY)
          currentY += 4
        }

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
          doc.rect(marginX, currentY - 3, currentX - marginX, rowHeight + 1, 'F')
        }

        doc.setDrawColor(209, 213, 219)
        doc.rect(marginX, currentY - 3, currentX - marginX, rowHeight + 1)

        columns.forEach((col, colIdx) => {
          if (colIdx < columns.length - 1) {
            const dividerX = col.x + col.width
            doc.line(dividerX, currentY - 3, dividerX, currentY - 3 + rowHeight + 1)
          }

          doc.setTextColor(30, 41, 59)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(9.5)

          rowValues[colIdx].forEach((line, lineIdx) => {
            const textY = currentY + (lineIdx * lineHeight)
            if (col.align === 'right') {
              doc.text(line, col.x + col.width - 3, textY, { align: 'right' })
            } else if (col.align === 'center') {
              doc.text(line, col.x + col.width / 2, textY, { align: 'center' })
            } else {
              doc.text(line, col.x + 3, textY)
            }
          })
        })

        currentY += rowHeight
      })

      const fileSuffix = filterEstado === 'TODOS' ? 'todos' : filterEstado.toLowerCase()
      doc.save(`prestamos_${fileSuffix}_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error('Error exportando PDF de préstamos:', error)
      if (error.message === 'MODULE_NOT_FOUND') {
        toast.error('No se pudo cargar la librería para exportar PDF')
      } else {
        toast.error('Error al exportar la lista de préstamos')
      }
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Préstamos</h1>
          <p className="text-gray-600 mt-1">Gestiona todos tus préstamos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportarPrestamosPorEstado}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Exportar {filterEstado === 'TODOS' ? 'todos' : filterEstado.toLowerCase()}</span>
          </button>
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

