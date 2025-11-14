import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Search, User, Phone, MapPin, DollarSign, FileText, Plus, Filter, List, Grid, Download } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'

export default function Clientes() {
  const { user } = useAuth()
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
      setLoading(true)
      const response = await api.get('/prestamos/clientes')
      
      const clientesData = response.data.map(cliente => ({
        id: cliente.id,
        nombre: cliente.nombre,
        telefono: cliente.telefono,
        direccion: cliente.direccion || '',
        zona: cliente.zona || '',
        email: cliente.email || '',
        totalPrestamos: cliente.totalPrestamos || 0,
        prestamosActivos: cliente.prestamosActivos || 0,
        totalPrestado: parseFloat(cliente.totalPrestado) || 0,
        saldoPendiente: parseFloat(cliente.saldoPendiente) || 0,
        ultimaActividad: cliente.ultimaActividad || new Date().toISOString().split('T')[0]
      }))
      
      setClientes(clientesData)
    } catch (error) {
      console.error('Error al cargar los clientes:', error)
      toast.error('Error al cargar los clientes')
      setClientes([])
    } finally {
      setLoading(false)
    }
  }

  const fetchZonas = async () => {
    try {
      const response = await api.get('/prestamos/zonas')
      setZonas(response.data || [])
    } catch (error) {
      console.error('Error al cargar zonas:', error)
      setZonas([])
    }
  }

  const exportarClientesPDF = async () => {
    if (filteredClientes.length === 0) {
      toast.info('No hay clientes para exportar')
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
      const lineHeight = 5
      const contentWidth = pageWidth - (marginX * 2)

      const totalClientes = filteredClientes.length
      const clientesActivos = filteredClientes.filter(c => c.prestamosActivos > 0).length
      const totalPrestado = filteredClientes.reduce((sum, c) => sum + (c.totalPrestado || 0), 0)
      const saldoPendiente = filteredClientes.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)

      const drawHeader = () => {
        doc.setFillColor(59, 130, 246)
        doc.rect(marginX, marginY - 18, contentWidth, 24, 'F')

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(20)
        doc.text('Reporte de Clientes', marginX + 8, marginY - 6)

        doc.setFontSize(11)
        doc.setFont('helvetica', 'normal')
        doc.text('Gestión de cartera y seguimiento', marginX + 8, marginY - 1)

        doc.setFontSize(10)
        const generadoPor = user?.nombreCompleto || user?.email || 'Usuario no identificado'
        doc.text(`Generado: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - marginX - 8, marginY - 8, { align: 'right' })
        doc.text(`Generado por: ${generadoPor}`, pageWidth - marginX - 8, marginY - 3, { align: 'right' })
        doc.text(`Filtros: zona ${filterZona === 'TODAS' ? 'todas' : filterZona}`, pageWidth - marginX - 8, marginY + 2, { align: 'right' })
      }

      const columns = [
        { title: 'Nombre', width: 40, align: 'left' },
        { title: 'Contacto', width: 50, align: 'left' },
        { title: 'Dirección', width: 52, align: 'left' },
        { title: 'Zona', width: 22, align: 'left' },
        { title: 'Préstamos', width: 32, align: 'left' },
        { title: 'Total Prestado', width: 36, align: 'right' },
        { title: 'Saldo Pendiente', width: 36, align: 'right' }
      ]

      let currentX = marginX
      columns.forEach((col) => {
        col.x = currentX
        currentX += col.width
      })

      const drawTableHeader = (startY) => {
        doc.setFillColor(226, 232, 240)
        doc.roundedRect(marginX, startY - 8, currentX - marginX, 11, 2, 2, 'F')
        doc.setDrawColor(203, 213, 225)
        doc.roundedRect(marginX, startY - 8, currentX - marginX, 11, 2, 2)
        doc.setTextColor(30, 41, 59)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10.5)
        columns.forEach((col) => {
          const titleText = col.title || ''
          const textX = col.align === 'right' ? col.x + col.width - 2 : col.x + 2
          doc.text(titleText.toUpperCase(), textX, startY - 2, { align: col.align === 'right' ? 'right' : 'left' })
        })
      }

      const getRowData = (cliente) => ([
        cliente.nombre || 'N/A',
        `${cliente.telefono || 'Sin teléfono'}${cliente.email ? ` · ${cliente.email}` : ''}`,
        cliente.direccion || 'Sin dirección',
        cliente.zona || 'N/A',
        `${cliente.totalPrestamos} total / ${cliente.prestamosActivos} activos`,
        `$${(cliente.totalPrestado || 0).toLocaleString('es-CO')}`,
        `$${(cliente.saldoPendiente || 0).toLocaleString('es-CO')}`
      ])

      const drawSummary = (startY) => {
        const cards = [
          { label: 'Clientes registrados', value: totalClientes },
          { label: 'Clientes activos', value: clientesActivos },
          { label: 'Total prestado', value: totalPrestado },
          { label: 'Saldo pendiente', value: saldoPendiente }
        ]

        cards.forEach((card, idx) => {
          const baseWidth = (contentWidth - 9) / cards.length
          const cardWidth = baseWidth
          const x = marginX + idx * (cardWidth + 3)
          doc.setFillColor(248, 250, 252)
          doc.roundedRect(x, startY, cardWidth, 26, 3, 3, 'F')
          doc.setDrawColor(224, 231, 255)
          doc.roundedRect(x, startY, cardWidth, 26, 3, 3)

          doc.setTextColor(100, 116, 139)
          doc.setFont('helvetica', 'medium')
          doc.setFontSize(9)
          doc.text(card.label.toUpperCase(), x + 4, startY + 8)

          doc.setTextColor(30, 41, 59)
          doc.setFont('helvetica', 'bold')
          doc.setFontSize(12)

          if (typeof card.value === 'number') {
            const number = `$${card.value.toLocaleString('es-CO')}`
            const lines = doc.splitTextToSize(number, cardWidth - 8)
            lines.forEach((line, lineIdx) => {
              doc.text(line, x + 4, startY + 16 + (lineIdx * 5))
            })
          } else {
            doc.text(String(card.value), x + 4, startY + 16)
          }
        })

        return startY + 34
      }

      drawHeader()

      let currentY = drawSummary(marginY + 6)
      currentY += 10
      drawTableHeader(currentY)
      currentY += 4

      filteredClientes.forEach((cliente, index) => {
        const rowValues = getRowData(cliente).map((value, idx) =>
          doc.splitTextToSize(String(value), columns[idx].width - 4)
        )

        const rowHeight = Math.max(...rowValues.map((lines) => lines.length)) * lineHeight + 2

        if (currentY + rowHeight > pageHeight - marginY) {
          doc.addPage()
          drawHeader()
          currentY = marginY + 14
          drawTableHeader(currentY)
          currentY += 4
        }

        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252)
          doc.rect(marginX, currentY - 3, currentX - marginX, rowHeight + 1, 'F')
        }

        doc.setDrawColor(226, 232, 240)
        doc.rect(marginX, currentY - 3, currentX - marginX, rowHeight + 1)

        columns.forEach((col, colIdx) => {
          doc.setTextColor(30, 41, 59)
          doc.setFont('helvetica', 'normal')
          doc.setFontSize(10)

          rowValues[colIdx].forEach((line, lineIdx) => {
            const textY = currentY + (lineIdx * lineHeight)
            if (col.align === 'right') {
              doc.text(line, col.x + col.width - 3, textY, { align: 'right' })
            } else {
              doc.text(line, col.x + 3, textY)
            }
          })
        })

        currentY += rowHeight
      })

      doc.save(`clientes_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (error) {
      console.error('Error exportando PDF de clientes:', error)
      if (error.message === 'MODULE_NOT_FOUND') {
        toast.error('No se pudo cargar la librería para exportar PDF')
      } else {
        toast.error('Error al exportar la lista de clientes')
      }
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
          <button
            onClick={exportarClientesPDF}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Exportar PDF</span>
          </button>
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

      {/* Stats compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Clientes',
            value: clientes.length,
            icon: <User size={18} className="text-blue-600" />,
          },
          {
            label: 'Clientes Activos',
            value: clientes.filter(c => c.prestamosActivos > 0).length,
            icon: <FileText size={18} className="text-emerald-600" />,
          },
          {
            label: 'Total Prestado',
            value: `$${clientes.reduce((sum, c) => sum + c.totalPrestado, 0).toLocaleString('es-CO')}`,
            icon: <DollarSign size={18} className="text-purple-600" />,
          },
          {
            label: 'Saldo Pendiente',
            value: `$${clientes.reduce((sum, c) => sum + c.saldoPendiente, 0).toLocaleString('es-CO')}`,
            icon: <DollarSign size={18} className="text-amber-600" />,
          },
        ].map(({ label, value, icon }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm sm:px-4 sm:py-3"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                {icon}
              </div>
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
            </div>
            <p className="text-base sm:text-lg font-semibold text-gray-900">{value}</p>
          </div>
        ))}
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

