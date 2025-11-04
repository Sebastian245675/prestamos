import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { prestamosService } from '../services/prestamosService'
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  MapPin, 
  User, 
  Plus, 
  History,
  CreditCard,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Phone,
  Mail,
  Hash,
  RefreshCw,
  Edit,
  Clock,
  Download
} from 'lucide-react'
import { format, addDays, differenceInDays } from 'date-fns'

export default function DetallePrestamo() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [prestamo, setPrestamo] = useState(null)
  const [abonos, setAbonos] = useState([])
  const [cuotas, setCuotas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAbonoModal, setShowAbonoModal] = useState(false)
  const [abonoForm, setAbonoForm] = useState({
    monto: '',
    fechaAbono: new Date().toISOString().split('T')[0],
    observaciones: '',
    enviarComprobante: false,
    esSoloIntereses: false
  })
  const [atrasoManual, setAtrasoManual] = useState(0)

  useEffect(() => {
    fetchPrestamo()
  }, [id])

  const fetchPrestamo = async () => {
    try {
      setLoading(true)
      const prestamoData = await prestamosService.getPrestamoById(id)
      setPrestamo(prestamoData)
      
      await Promise.all([
        fetchAbonos(),
        fetchCuotas()
      ])
    } catch (error) {
      console.error('Error al cargar el préstamo:', error)
      toast.error('Error al cargar el préstamo')
      navigate('/prestamos')
    } finally {
      setLoading(false)
    }
  }

  const fetchAbonos = async () => {
    try {
      const abonosData = await prestamosService.getAbonos(id)
      setAbonos(abonosData)
    } catch (error) {
      console.error('Error al cargar abonos:', error)
      setAbonos([])
    }
  }

  const fetchCuotas = async () => {
    try {
      const cuotasData = await prestamosService.getCuotas(id)
      setCuotas(cuotasData)
    } catch (error) {
      console.error('Error al cargar cuotas:', error)
      setCuotas([])
    }
  }

  const handleRegistrarAbono = async (e) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión para registrar un abono')
      return
    }
    
    try {
      const monto = parseFloat(abonoForm.monto)
      if (isNaN(monto) || monto <= 0) {
        toast.error('El monto debe ser mayor a cero')
        return
      }
      
      await prestamosService.registrarAbono(id, user.id, {
        monto: monto,
        fechaAbono: abonoForm.fechaAbono,
        observaciones: abonoForm.observaciones || null
      })
      
      if (abonoForm.enviarComprobante && prestamo.email) {
        toast.success('Abono registrado y comprobante enviado al cliente')
      } else {
        toast.success('Abono registrado exitosamente')
      }
      
      setShowAbonoModal(false)
      setAbonoForm({ 
        monto: '', 
        fechaAbono: new Date().toISOString().split('T')[0], 
        observaciones: '',
        enviarComprobante: false,
        esSoloIntereses: false
      })
      
      // Recargar datos
      await Promise.all([
        fetchPrestamo(),
        fetchAbonos(),
        fetchCuotas()
      ])
    } catch (error) {
      console.error('Error al registrar abono:', error)
      toast.error(error.response?.data?.message || 'Error al registrar el abono')
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

  const getFrecuenciaTexto = (frecuencia) => {
    const textos = {
      DIARIO: 'Diario (Lunes a Domingo)',
      SEMANAL: 'Semanal',
      QUINCENAL: 'Quincenal',
      MENSUAL: 'Mensual'
    }
    return textos[frecuencia] || frecuencia
  }

  const handleAtrasoManual = async (dias) => {
    setAtrasoManual(dias)
    // TODO: Implementar endpoint en backend para actualizar atraso manual
    toast.success('Atraso manual actualizado (funcionalidad pendiente)')
    setPrestamo({ ...prestamo, atrasoManual: dias })
  }

  const calcularProximoPago = () => {
    if (!prestamo) return null
    const fechaInicio = new Date(prestamo.fechaInicio)
    const diasSumar = prestamo.cuotasPagadas > 0 ? prestamo.cuotasPagadas : 1
    
    switch (prestamo.frecuenciaPago) {
      case 'DIARIO':
        return format(addDays(fechaInicio, diasSumar), 'yyyy-MM-dd')
      case 'SEMANAL':
        return format(addDays(fechaInicio, diasSumar * 7), 'yyyy-MM-dd')
      case 'QUINCENAL':
        return format(addDays(fechaInicio, diasSumar * 15), 'yyyy-MM-dd')
      case 'MENSUAL':
        return prestamo.proximoPago || format(addDays(fechaInicio, diasSumar * 30), 'yyyy-MM-dd')
      default:
        return prestamo.proximoPago
    }
  }

  const exportarPDF = async () => {
    if (!prestamo) return

    try {
      // Importar jsPDF dinámicamente
      const jspdfModule = await import('jspdf')
      // jspdf 2.x exporta jsPDF como named export o default
      const jsPDFClass = jspdfModule.jsPDF || (jspdfModule.default && (jspdfModule.default.jsPDF || jspdfModule.default)) || jspdfModule.default
      
      if (!jsPDFClass) {
        throw new Error('MODULE_NOT_FOUND')
      }
      
      const doc = new jsPDFClass({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })
      let yPosition = 20
      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - (margin * 2)
      
      // Función helper para dibujar líneas
      const drawLine = (y) => {
        doc.setDrawColor(200, 200, 200)
        doc.line(margin, y, pageWidth - margin, y)
      }
      
      // Función helper para sección con título
      const addSectionTitle = (title, y) => {
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(50, 50, 50)
        doc.text(title, margin, y)
        drawLine(y + 2)
        return y + 8
      }

      // Header
      doc.setFillColor(59, 130, 246) // Azul
      doc.rect(margin, 10, pageWidth - (margin * 2), 15, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(18)
      doc.setFont('helvetica', 'bold')
      doc.text('DETALLE DE PRÉSTAMO', margin + 5, 20)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha de reporte: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - margin - 5, 20, { align: 'right' })
      
      yPosition = 32
      doc.setTextColor(0, 0, 0)

      // Información del Cliente
      yPosition = addSectionTitle('INFORMACIÓN DEL CLIENTE', yPosition)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      const clientInfo = [
        ['Nombre:', prestamo.nombreCliente],
        ['Identificación:', prestamo.numeroIdentificacion || 'N/A'],
        ['Celular:', prestamo.telefono],
        ['Dirección:', prestamo.direccion || 'N/A'],
        ['Email:', prestamo.email || 'N/A'],
        ['Ruta:', prestamo.ruta || 'Sin ruta'],
        ['Frecuencia de pago:', prestamo.frecuenciaPagoTexto || getFrecuenciaTexto(prestamo.frecuenciaPago)],
        ['Fecha de registro:', prestamo.fechaInicio ? format(new Date(prestamo.fechaInicio), 'dd/MM/yyyy') : 'N/A'],
        ['Fecha final:', prestamo.fechaFinal ? format(new Date(prestamo.fechaFinal), 'dd/MM/yyyy') : 'N/A'],
      ]
      
      clientInfo.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.text(label, margin, yPosition)
        doc.setFont('helvetica', 'normal')
        doc.text(value, margin + 45, yPosition)
        yPosition += 6
      })
      
      if (prestamo.observacion && prestamo.observacion !== 'Sin observación') {
        doc.setFont('helvetica', 'bold')
        doc.text('Observación:', margin, yPosition)
        doc.setFont('helvetica', 'normal')
        const observacionLines = doc.splitTextToSize(prestamo.observacion, maxWidth - 45)
        doc.text(observacionLines, margin + 45, yPosition)
        yPosition += observacionLines.length * 5
      }
      
      yPosition += 8

      // Estado del Préstamo - Tabla de resumen
      yPosition = addSectionTitle('RESUMEN DEL PRÉSTAMO', yPosition)
      
      // Tabla de resumen financiero
      const tableStartY = yPosition
      const col1X = margin
      const col2X = margin + 85
      const rowHeight = 7
      
      // Headers de la tabla
      doc.setFillColor(240, 240, 240)
      doc.rect(col1X, tableStartY, 85, rowHeight, 'F')
      doc.rect(col2X, tableStartY, 85, rowHeight, 'F')
      
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Concepto', col1X + 2, tableStartY + 5)
      doc.text('Valor', col2X + 2, tableStartY + 5)
      
      yPosition = tableStartY + rowHeight
      
      // Filas de datos
      const resumenData = [
        ['Estado:', prestamo.estado],
        ['Monto prestado:', `$${prestamo.montoPrestado.toLocaleString('es-CO')}`],
        ['Número de cuotas:', prestamo.numeroCuotas.toString()],
        ['Cuotas pagadas:', prestamo.cuotasPagadas.toString()],
        ['Interés:', prestamo.interesPorcentaje ? `${prestamo.interesPorcentaje}%` : 'N/A'],
        ['Valor por cuota:', prestamo.valorCuota ? `$${prestamo.valorCuota.toLocaleString('es-CO')}` : 'N/A'],
        ['Total a pagar:', prestamo.totalPagar ? `$${prestamo.totalPagar.toLocaleString('es-CO')}` : 'N/A'],
        ['Monto pagado:', prestamo.montoPagado !== undefined ? `$${prestamo.montoPagado.toLocaleString('es-CO')}` : '$0'],
        ['Saldo pendiente:', prestamo.saldoPendiente !== undefined ? `$${prestamo.saldoPendiente.toLocaleString('es-CO')}` : 'N/A'],
        ['Próximo pago:', proximoPago ? format(new Date(proximoPago), 'dd/MM/yyyy') : 'N/A'],
        ['Atraso manual:', prestamo.atrasoManual !== undefined ? `${prestamo.atrasoManual} días` : '0 días'],
      ]
      
      resumenData.forEach(([label, value], index) => {
        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250)
        } else {
          doc.setFillColor(255, 255, 255)
        }
        doc.rect(col1X, yPosition, 85, rowHeight, 'F')
        doc.rect(col2X, yPosition, 85, rowHeight, 'F')
        
        doc.setDrawColor(220, 220, 220)
        doc.line(col1X, yPosition, col1X, yPosition + rowHeight)
        doc.line(col2X, yPosition, col2X, yPosition + rowHeight)
        doc.line(col1X + 85, yPosition, col1X + 85, yPosition + rowHeight)
        doc.line(pageWidth - margin, yPosition, pageWidth - margin, yPosition + rowHeight)
        doc.line(col1X, yPosition, pageWidth - margin, yPosition)
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(60, 60, 60)
        doc.text(label, col1X + 2, yPosition + 5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        doc.text(value, col2X + 2, yPosition + 5)
        
        yPosition += rowHeight
      })
      
      // Línea final de la tabla
      doc.line(col1X, yPosition, pageWidth - margin, yPosition)
      
      // Progreso
      const progreso = prestamo.numeroCuotas > 0 ? (prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100 : 0
      yPosition += 8
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(`Progreso de pago: ${progreso.toFixed(0)}%`, margin, yPosition)
      yPosition += 10

      // Historial de Abonos - Tabla profesional
      if (abonos.length > 0) {
        if (yPosition > 240) {
          doc.addPage()
          yPosition = 20
        }
        
        yPosition = addSectionTitle('HISTORIAL DE ABONOS', yPosition)
        
        // Tabla de abonos
        const abonoTableY = yPosition
        const abonoCol1X = margin
        const abonoCol2X = margin + 40
        const abonoCol3X = margin + 100
        const abonoCol4X = margin + 140
        const abonoRowHeight = 7
        
        // Header de la tabla
        doc.setFillColor(59, 130, 246)
        doc.rect(abonoCol1X, abonoTableY, 40, abonoRowHeight, 'F')
        doc.rect(abonoCol2X, abonoTableY, 60, abonoRowHeight, 'F')
        doc.rect(abonoCol3X, abonoTableY, 40, abonoRowHeight, 'F')
        doc.rect(abonoCol4X, abonoTableY, maxWidth - 140, abonoRowHeight, 'F')
        
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text('#', abonoCol1X + 2, abonoTableY + 5)
        doc.text('Fecha', abonoCol2X + 2, abonoTableY + 5)
        doc.text('Monto', abonoCol3X + 2, abonoTableY + 5)
        doc.text('Observaciones', abonoCol4X + 2, abonoTableY + 5)
        
        yPosition = abonoTableY + abonoRowHeight
        doc.setTextColor(0, 0, 0)
        
        // Filas de abonos
        abonos.forEach((abono, index) => {
          if (yPosition > 270) {
            doc.addPage()
            yPosition = 20
            yPosition = addSectionTitle('HISTORIAL DE ABONOS (continuación)', yPosition)
            // Redibujar headers
            doc.setFillColor(59, 130, 246)
            doc.rect(abonoCol1X, yPosition, 40, abonoRowHeight, 'F')
            doc.rect(abonoCol2X, yPosition, 60, abonoRowHeight, 'F')
            doc.rect(abonoCol3X, yPosition, 40, abonoRowHeight, 'F')
            doc.rect(abonoCol4X, yPosition, maxWidth - 140, abonoRowHeight, 'F')
            doc.setFontSize(9)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(255, 255, 255)
            doc.text('#', abonoCol1X + 2, yPosition + 5)
            doc.text('Fecha', abonoCol2X + 2, yPosition + 5)
            doc.text('Monto', abonoCol3X + 2, yPosition + 5)
            doc.text('Observaciones', abonoCol4X + 2, yPosition + 5)
            yPosition += abonoRowHeight
            doc.setTextColor(0, 0, 0)
          }
          
          // Alternar color de filas
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250)
          } else {
            doc.setFillColor(255, 255, 255)
          }
          doc.rect(abonoCol1X, yPosition, 40, abonoRowHeight, 'F')
          doc.rect(abonoCol2X, yPosition, 60, abonoRowHeight, 'F')
          doc.rect(abonoCol3X, yPosition, 40, abonoRowHeight, 'F')
          doc.rect(abonoCol4X, yPosition, maxWidth - 140, abonoRowHeight, 'F')
          
          // Bordes
          doc.setDrawColor(220, 220, 220)
          doc.line(abonoCol1X, yPosition, abonoCol1X, yPosition + abonoRowHeight)
          doc.line(abonoCol2X, yPosition, abonoCol2X, yPosition + abonoRowHeight)
          doc.line(abonoCol3X, yPosition, abonoCol3X, yPosition + abonoRowHeight)
          doc.line(abonoCol4X, yPosition, abonoCol4X, yPosition + abonoRowHeight)
          doc.line(pageWidth - margin, yPosition, pageWidth - margin, yPosition + abonoRowHeight)
          doc.line(abonoCol1X, yPosition, pageWidth - margin, yPosition)
          
          doc.setFontSize(9)
          doc.setFont('helvetica', 'normal')
          doc.text((index + 1).toString(), abonoCol1X + 2, yPosition + 5)
          doc.text(format(new Date(abono.fechaAbono), 'dd/MM/yyyy'), abonoCol2X + 2, yPosition + 5)
          doc.setFont('helvetica', 'bold')
          doc.text(`$${abono.monto.toLocaleString('es-CO')}`, abonoCol3X + 2, yPosition + 5)
          doc.setFont('helvetica', 'normal')
          const observaciones = abono.observaciones || '-'
          const obsLines = doc.splitTextToSize(observaciones, maxWidth - 140)
          doc.text(obsLines, abonoCol4X + 2, yPosition + 5)
          
          yPosition += abonoRowHeight
          if (obsLines.length > 1) {
            yPosition += (obsLines.length - 1) * 5
          }
        })
        
        // Línea final
        doc.line(abonoCol1X, yPosition, pageWidth - margin, yPosition)
        yPosition += 8
        
        // Total de abonos
        const totalAbonos = abonos.reduce((sum, abono) => sum + parseFloat(abono.monto), 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.text(`Total abonado: $${totalAbonos.toLocaleString('es-CO')}`, pageWidth - margin, yPosition, { align: 'right' })
      }

      // Guardar PDF
      doc.save(`Prestamo_${prestamo.nombreCliente.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.pdf`)
      toast.success('PDF exportado exitosamente')
    } catch (error) {
      console.error('Error al exportar PDF:', error)
      if (error.message === 'MODULE_NOT_FOUND' || 
          (error.message && error.message.includes('Failed to resolve module specifier')) ||
          (error.message && error.message.includes('Cannot find module'))) {
        toast.error('El paquete jspdf no está instalado. Por favor ejecuta: npm install', {
          duration: 5000
        })
      } else {
        toast.error('Error al exportar PDF. Asegúrate de que jspdf esté instalado: npm install')
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

  if (!prestamo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Préstamo no encontrado</p>
        <Link to="/prestamos" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
          Volver a préstamos
        </Link>
      </div>
    )
  }

  const proximoPago = calcularProximoPago()

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link to="/prestamos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{prestamo.nombreCliente}</h1>
          <p className="text-gray-600 mt-1">Detalles del préstamo</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setAbonoForm({
                monto: '',
                fechaAbono: new Date().toISOString().split('T')[0],
                observaciones: '',
                enviarComprobante: false,
                esSoloIntereses: false
              })
              setShowAbonoModal(true)
            }}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Registrar Abono</span>
          </button>
          <button
            onClick={() => {
              setAbonoForm({
                monto: '',
                fechaAbono: new Date().toISOString().split('T')[0],
                observaciones: '',
                enviarComprobante: false,
                esSoloIntereses: true
              })
              setShowAbonoModal(true)
            }}
            className="btn-secondary inline-flex items-center space-x-2 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
          >
            <DollarSign size={20} />
            <span>Pago de Intereses</span>
          </button>
          <button
            onClick={exportarPDF}
            className="btn-secondary inline-flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {/* Información Principal */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Cliente</h2>
          <div className="space-y-3">
            <div className="flex items-center text-gray-600">
              <User size={18} className="mr-2" />
              <span>{prestamo.nombreCliente}</span>
            </div>
            {prestamo.numeroIdentificacion && (
              <div className="flex items-center text-gray-600">
                <Hash size={18} className="mr-2" />
                <span>Identificación: {prestamo.numeroIdentificacion}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <Phone size={18} className="mr-2" />
              <span>Celular: {prestamo.telefono}</span>
            </div>
            {prestamo.direccion && (
              <div className="flex items-center text-gray-600">
                <MapPin size={18} className="mr-2" />
                <span>{prestamo.direccion}</span>
              </div>
            )}
            {prestamo.email && (
              <div className="flex items-center text-gray-600">
                <Mail size={18} className="mr-2" />
                <span>{prestamo.email}</span>
              </div>
            )}
            <div className="flex items-center text-gray-600">
              <MapPin size={18} className="mr-2" />
              <span>Ruta: {prestamo.ruta || prestamo.zona || 'Sin ruta'}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <RefreshCw size={18} className="mr-2" />
              <span>Frecuencia: {prestamo.frecuenciaPagoTexto || getFrecuenciaTexto(prestamo.frecuenciaPago)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar size={18} className="mr-2" />
              <span>Registro: {format(new Date(prestamo.fechaInicio), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock size={18} className="mr-2" />
              <span>Final: {format(new Date(prestamo.fechaFinal || prestamo.fechaVencimiento), 'dd/MM/yyyy')}</span>
            </div>
            <div className="flex items-start text-gray-600 pt-2 border-t border-gray-200">
              <FileText size={18} className="mr-2 mt-0.5" />
              <div>
                <span className="block mb-1">Observación:</span>
                <span className="text-sm">{prestamo.observacion || 'Sin observación'}</span>
              </div>
            </div>
            <div className="flex items-start text-gray-600 pt-2 border-t border-gray-200">
              <ImageIcon size={18} className="mr-2 mt-0.5" />
              <div>
                <span className="block mb-1">Foto:</span>
                {prestamo.imagenCliente ? (
                  <img src={prestamo.imagenCliente} alt={prestamo.nombreCliente} className="w-20 h-20 rounded-lg object-cover border-2 border-gray-200" />
                ) : (
                  <span className="text-sm">Sin foto</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado del Préstamo</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Estado:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getEstadoBadge(prestamo.estado)}`}>
                {prestamo.estado}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💰 Monto prestado:</span>
              <span className="font-semibold text-gray-900">
                ${prestamo.montoPrestado?.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💳 Cuotas:</span>
              <span className="font-semibold text-gray-900">
                {prestamo.numeroCuotas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">📆 Pagadas:</span>
              <span className="font-semibold text-gray-900">
                {prestamo.cuotasPagadas}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">📈 Interés:</span>
              <span className="font-semibold text-gray-900">
                {prestamo.interesPorcentaje || 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💸 Valor por cuota:</span>
              <span className="font-semibold text-gray-900">
                ${(prestamo.valorCuota || (prestamo.totalPagar / prestamo.numeroCuotas) || 0).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💰 Total a pagar:</span>
              <span className="font-semibold text-blue-600">
                ${(prestamo.totalPagar || prestamo.saldoPendiente).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">✅ Pagado:</span>
              <span className="font-semibold text-green-600">
                ${(prestamo.montoPagado || (prestamo.montoPrestado - prestamo.saldoPendiente)).toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">💥 Pendiente:</span>
              <span className="font-semibold text-orange-600">
                ${prestamo.saldoPendiente?.toLocaleString('es-CO')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">📆 Próximo Pago:</span>
              <span className="font-semibold text-gray-900">
                {proximoPago ? format(new Date(proximoPago), 'dd/MM/yyyy') : 'N/A'}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progreso</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(prestamo.cuotasPagadas / prestamo.numeroCuotas) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">➕ Atraso manual (días):</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAtrasoManual(Math.max(0, (prestamo.atrasoManual || 0) - 1))}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={prestamo.atrasoManual || 0}
                    onChange={(e) => handleAtrasoManual(parseInt(e.target.value) || 0)}
                    className="w-16 h-8 text-center border border-gray-300 rounded-lg text-sm font-semibold"
                    min="0"
                  />
                  <button
                    onClick={() => handleAtrasoManual((prestamo.atrasoManual || 0) + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cuotas */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuotas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cuota #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Historial de Abonos</h2>
          <History size={20} className="text-gray-600" />
        </div>
        {abonos.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay abonos registrados</p>
        ) : (
          <div className="space-y-3">
            {abonos.map((abono) => (
              <div
                key={abono.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    ${abono.monto?.toLocaleString('es-CO')}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(abono.fechaAbono).toLocaleDateString('es-CO')}
                  </p>
                </div>
                {abono.observaciones && (
                  <p className="text-sm text-gray-600">{abono.observaciones}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Abono */}
      {showAbonoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-start z-50 p-4 lg:pl-8 lg:justify-start">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 lg:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {abonoForm.esSoloIntereses ? 'Registrar Pago de Intereses' : 'Registrar Abono'}
            </h2>
            <form onSubmit={handleRegistrarAbono} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto *
                </label>
                <input
                  type="number"
                  value={abonoForm.monto}
                  onChange={(e) => setAbonoForm({ ...abonoForm, monto: e.target.value })}
                  className="input-field"
                  required
                  min="1"
                  step="0.01"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Abono *
                </label>
                <input
                  type="date"
                  value={abonoForm.fechaAbono}
                  onChange={(e) => setAbonoForm({ ...abonoForm, fechaAbono: e.target.value })}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={abonoForm.observaciones}
                  onChange={(e) => setAbonoForm({ ...abonoForm, observaciones: e.target.value })}
                  className="input-field"
                  rows="3"
                  placeholder="Notas adicionales sobre el abono..."
                />
              </div>

              {abonoForm.esSoloIntereses && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-900">
                    ⚠️ Este abono es solo para intereses y no reducirá el capital pendiente del préstamo.
                  </p>
                </div>
              )}

              {prestamo.email && (
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="enviarComprobante"
                    checked={abonoForm.enviarComprobante}
                    onChange={(e) => setAbonoForm({ ...abonoForm, enviarComprobante: e.target.checked })}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                  />
                  <div className="flex-1">
                    <label htmlFor="enviarComprobante" className="cursor-pointer">
                      <p className="text-sm font-medium text-gray-900">
                        Enviar comprobante por correo al cliente
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Se enviará un comprobante de pago al correo: <span className="font-medium">{prestamo.email}</span>
                      </p>
                    </label>
                  </div>
                </div>
              )}

              {!prestamo.email && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Este cliente no tiene correo electrónico registrado. 
                    Agrega un correo en la información del préstamo para poder enviar comprobantes.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAbonoModal(false)
                    setAbonoForm({
                      monto: '',
                      fechaAbono: new Date().toISOString().split('T')[0],
                      observaciones: '',
                      enviarComprobante: false,
                      esSoloIntereses: false
                    })
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {abonoForm.esSoloIntereses ? 'Registrar Pago de Intereses' : 'Registrar Abono'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

