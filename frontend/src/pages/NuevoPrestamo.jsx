import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { prestamosService } from '../services/prestamosService'
import { 
  ArrowLeft, 
  Upload, 
  X, 
  User, 
  Calculator,
  DollarSign,
  Calendar,
  FileText,
  Info
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { addMonths, addWeeks, addDays, format } from 'date-fns'

export default function NuevoPrestamo() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombreCliente: '',
    numeroIdentificacion: '',
    telefono: '',
    email: '',
    montoPrestado: '',
    montoPrestadoFormatted: '',
    tipoInteres: 'SIMPLE_GLOBAL', // SIMPLE_GLOBAL o SIMPLE_PERIODO
    interesPorcentaje: '',
    interesPorPeriodo: '',
    numeroCuotas: '',
    frecuenciaPago: 'MENSUAL',
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFinal: '',
    zona: '',
    observacion: '',
    recordatoriosActivos: true
  })
  const [imagenCliente, setImagenCliente] = useState(null)
  const [imagenPreview, setImagenPreview] = useState(null)
  const [archivos, setArchivos] = useState([])

  // Formatear número con separadores de miles
  const formatNumber = (num) => {
    if (!num) return ''
    const numStr = num.toString().replace(/\D/g, '')
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  // Convertir número formateado a número real
  const parseFormattedNumber = (formatted) => {
    return parseFloat(formatted.replace(/\./g, '')) || 0
  }

  // Calcular fecha final basada en frecuencia y cuotas
  const calcularFechaFinal = (fechaInicio, numeroCuotas, frecuenciaPago) => {
    if (!fechaInicio || !numeroCuotas || numeroCuotas <= 0) return ''
    
    const fecha = new Date(fechaInicio)
    const cuotas = parseInt(numeroCuotas)
    
    switch (frecuenciaPago) {
      case 'DIARIO':
        return format(addDays(fecha, cuotas), 'yyyy-MM-dd')
      case 'SEMANAL':
        return format(addWeeks(fecha, cuotas), 'yyyy-MM-dd')
      case 'QUINCENAL':
        return format(addWeeks(fecha, cuotas * 2), 'yyyy-MM-dd')
      case 'MENSUAL':
        return format(addMonths(fecha, cuotas), 'yyyy-MM-dd')
      default:
        return format(addMonths(fecha, cuotas), 'yyyy-MM-dd')
    }
  }

  // Cálculos de interés y totales
  const calculos = useMemo(() => {
    const monto = parseFormattedNumber(formData.montoPrestadoFormatted || formData.montoPrestado)
    const interes = parseFloat(formData.interesPorcentaje) || 0
    const cuotas = parseInt(formData.numeroCuotas) || 0

    if (!monto || !interes || !cuotas) {
      return {
        totalPagar: 0,
        valorCuota: 0,
        ganancia: 0
      }
    }

    let totalPagar = 0
    let valorCuota = 0

    if (formData.tipoInteres === 'SIMPLE_GLOBAL') {
      // Interés simple global: M = C × (1 + i)
      // i es el porcentaje total (ej: 30% = 0.30)
      const tasaDecimal = interes / 100
      totalPagar = monto * (1 + tasaDecimal)
      valorCuota = cuotas > 0 ? totalPagar / cuotas : 0
    } else if (formData.tipoInteres === 'SIMPLE_PERIODO') {
      // Interés simple por período: cada período se calcula el interés
      const interesPorPeriodo = parseFloat(formData.interesPorPeriodo) || 0
      const tasaPeriodoDecimal = interesPorPeriodo / 100
      const interesTotal = monto * tasaPeriodoDecimal * cuotas
      totalPagar = monto + interesTotal
      valorCuota = cuotas > 0 ? totalPagar / cuotas : 0
    }

    const ganancia = totalPagar - monto

    return {
      totalPagar: Math.round(totalPagar),
      valorCuota: Math.round(valorCuota),
      ganancia: Math.round(ganancia)
    }
  }, [
    formData.montoPrestadoFormatted,
    formData.montoPrestado,
    formData.tipoInteres,
    formData.interesPorcentaje,
    formData.interesPorPeriodo,
    formData.numeroCuotas
  ])

  // Actualizar fecha final cuando cambian cuotas o frecuencia
  useEffect(() => {
    if (formData.numeroCuotas && formData.fechaInicio && formData.frecuenciaPago) {
      const fechaFinal = calcularFechaFinal(
        formData.fechaInicio,
        formData.numeroCuotas,
        formData.frecuenciaPago
      )
      if (fechaFinal && !formData.fechaFinal) {
        setFormData({ ...formData, fechaFinal })
      }
    }
  }, [formData.numeroCuotas, formData.fechaInicio, formData.frecuenciaPago])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name === 'montoPrestado') {
      const formatted = formatNumber(value)
      setFormData({
        ...formData,
        montoPrestado: value,
        montoPrestadoFormatted: formatted
      })
    } else if (name === 'numeroCuotas' && formData.tipoInteres === 'SIMPLE_PERIODO') {
      // Si es simple por período y cambian las cuotas, recalcular interés total
      const interesPeriodo = parseFloat(formData.interesPorPeriodo) || 0
      if (interesPeriodo > 0 && value > 0) {
        const cuotas = parseInt(value)
        // El interés total es el interés por período multiplicado por el número de períodos
        const interesTotal = interesPeriodo * cuotas
        setFormData({
          ...formData,
          [name]: value,
          interesPorcentaje: interesTotal.toFixed(2)
        })
      } else {
        setFormData({ ...formData, [name]: value })
      }
    } else if (name === 'interesPorPeriodo' && formData.tipoInteres === 'SIMPLE_PERIODO') {
      // Si cambia el interés por período, recalcular interés total
      const cuotas = parseInt(formData.numeroCuotas) || 0
      if (cuotas > 0 && value) {
        const interesPeriodo = parseFloat(value) || 0
        // El interés total es el interés por período multiplicado por el número de períodos
        const interesTotal = interesPeriodo * cuotas
        setFormData({
          ...formData,
          [name]: value,
          interesPorcentaje: interesTotal.toFixed(2)
        })
      } else {
        setFormData({ ...formData, [name]: value })
      }
    } else {
      const newValue = type === 'checkbox' ? checked : value
      let updatedData = { ...formData, [name]: newValue }
      
      // Recalcular fecha final si cambian cuotas o frecuencia
      if ((name === 'numeroCuotas' || name === 'frecuenciaPago' || name === 'fechaInicio') && 
          updatedData.numeroCuotas && updatedData.fechaInicio && updatedData.frecuenciaPago) {
        updatedData.fechaFinal = calcularFechaFinal(
          updatedData.fechaInicio,
          updatedData.numeroCuotas,
          updatedData.frecuenciaPago
        )
      }
      
      setFormData(updatedData)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) { // 10MB max
        toast.error(`${file.name} excede el tamaño máximo de 10MB`)
        return false
      }
      return true
    })
    setArchivos([...archivos, ...validFiles])
  }

  const handleRemoveFile = (index) => {
    setArchivos(archivos.filter((_, i) => i !== index))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        toast.error('Por favor selecciona una imagen válida')
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('La imagen no debe superar los 5MB')
        return
      }

      setImagenCliente(file)
      
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagenPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImagenCliente(null)
    setImagenPreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user?.id) {
      toast.error('Debes iniciar sesión para crear un préstamo')
      return
    }

    setLoading(true)

    try {
      const montoPrestado = parseFormattedNumber(formData.montoPrestadoFormatted || formData.montoPrestado)
      
      const prestamoData = {
        nombreCliente: formData.nombreCliente,
        telefono: formData.telefono,
        email: formData.email || null,
        montoPrestado: montoPrestado,
        numeroCuotas: parseInt(formData.numeroCuotas),
        frecuenciaPago: formData.frecuenciaPago,
        fechaInicio: formData.fechaInicio,
        fechaVencimiento: formData.fechaFinal || calcularFechaFinal(formData.fechaInicio, formData.numeroCuotas, formData.frecuenciaPago),
        zona: formData.zona,
        recordatoriosActivos: formData.recordatoriosActivos,
        valorCuota: calculos.valorCuota,
        direccion: formData.observacion || ''
      }

      await prestamosService.createPrestamo(user.id, prestamoData)
      
      toast.success('Préstamo creado exitosamente')
      navigate('/prestamos')
    } catch (error) {
      console.error('Error creating prestamo:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el préstamo'
      
      // Si es un error de autenticación, no mostrar el toast porque el interceptor ya manejará la redirección
      if (error.response?.status === 401 || error.response?.status === 403) {
        const errorData = error.response?.data
        if (errorData?.message?.includes('autenticado') || errorData?.message?.includes('Token')) {
          toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
          // El interceptor ya manejará la redirección
          return
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-6">
      <div className="flex items-center space-x-3 sm:space-x-4">
        <Link to="/prestamos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation">
          <ArrowLeft size={24} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Nuevo Préstamo</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Registra un nuevo préstamo con cálculo de intereses</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Formulario Principal */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información del Cliente */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Información del Cliente</h2>
                <div className="space-y-4">
                  {/* Foto del Cliente */}
                  <div className="flex items-center space-x-3 sm:space-x-4 pb-4 border-b border-gray-200">
                    <div className="flex-shrink-0">
                      {imagenPreview ? (
                        <div className="relative">
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-primary-300">
                            <img
                              src={imagenPreview}
                              alt="Cliente"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors touch-manipulation"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-2 border-gray-300 flex items-center justify-center">
                          <User className="text-gray-400" size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Foto del Cliente (Opcional)
                      </label>
                      {!imagenPreview && (
                        <label className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors touch-manipulation">
                          <Upload className="mr-2" size={16} />
                          <span className="text-xs sm:text-sm">Subir Imagen</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF hasta 5MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombreCliente"
                      value={formData.nombreCliente}
                      onChange={handleChange}
                      className="input-field h-12 text-base"
                      required
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Identificación *
                    </label>
                    <input
                      type="text"
                      name="numeroIdentificacion"
                      value={formData.numeroIdentificacion}
                      onChange={handleChange}
                      className="input-field h-12 text-base"
                      required
                      placeholder="1234567890"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Número de Celular *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="input-field h-12 text-base"
                      required
                      placeholder="3001234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field h-12 text-base"
                      placeholder="cliente@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Zona/Sector *
                    </label>
                    <input
                      type="text"
                      name="zona"
                      value={formData.zona}
                      onChange={handleChange}
                      className="input-field h-12 text-base"
                      required
                      placeholder="Zona Norte"
                    />
                  </div>
                </div>
              </div>

              {/* Información del Préstamo */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Información del Préstamo</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Monto Prestado *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="text"
                        name="montoPrestado"
                        value={formData.montoPrestadoFormatted}
                        onChange={handleChange}
                        className="input-field h-12 text-base pl-7"
                        required
                        placeholder="1.000.000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Escribe el monto y verás puntuación automática (1.000, 1.000.000...).
                    </p>
                  </div>

                  {/* Tipo de Interés */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Interés *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoInteres: 'SIMPLE_GLOBAL' })}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                          formData.tipoInteres === 'SIMPLE_GLOBAL'
                            ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">Interés Simple (Global)</div>
                        <div className="text-xs text-gray-600">M = C × (1 + i)</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, tipoInteres: 'SIMPLE_PERIODO' })}
                        className={`p-3 sm:p-4 rounded-lg border-2 transition-all touch-manipulation ${
                          formData.tipoInteres === 'SIMPLE_PERIODO'
                            ? 'border-primary-600 bg-primary-50 text-primary-700 font-semibold'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-sm font-semibold mb-1">Interés por Período</div>
                        <div className="text-xs text-gray-600">Mensual</div>
                      </button>
                    </div>
                  </div>

                  {/* Campos de Interés según el tipo */}
                  {formData.tipoInteres === 'SIMPLE_GLOBAL' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interés (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="interesPorcentaje"
                          value={formData.interesPorcentaje}
                          onChange={handleChange}
                          className="input-field h-12 text-base pr-12"
                          required
                          min="0"
                          step="0.01"
                          placeholder="30"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Info size={12} className="mr-1" />
                        Interés simple (global): M = C × (1 + i)
                      </p>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Interés por Período (Mensual) (%) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          name="interesPorPeriodo"
                          value={formData.interesPorPeriodo}
                          onChange={handleChange}
                          className="input-field h-12 text-base pr-12"
                          required
                          min="0"
                          step="0.01"
                          placeholder="2.5"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        El interés total se calcula automáticamente según el número de cuotas.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Número de Cuotas *
                      </label>
                      <input
                        type="number"
                        name="numeroCuotas"
                        value={formData.numeroCuotas}
                        onChange={handleChange}
                        className="input-field h-12 text-base"
                        required
                        min="1"
                        placeholder="12"
                        disabled={formData.tipoInteres === 'SIMPLE_PERIODO' && !formData.interesPorPeriodo}
                      />
                      {formData.tipoInteres === 'SIMPLE_PERIODO' && (
                        <p className="text-xs text-gray-500 mt-1">
                          En "simple por período", este campo se llena automáticamente.
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Seleccionar Tipo de Pago *
                      </label>
                      <select
                        name="frecuenciaPago"
                        value={formData.frecuenciaPago}
                        onChange={handleChange}
                        className="input-field h-12 text-base"
                        required
                      >
                        <option value="DIARIO">Diario</option>
                        <option value="SEMANAL">Semanal</option>
                        <option value="QUINCENAL">Quincenal</option>
                        <option value="MENSUAL">Mensual</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha de Registro *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          name="fechaInicio"
                          value={formData.fechaInicio}
                          onChange={handleChange}
                          className="input-field h-12 text-base pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Fecha Final de Pago *
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                          type="date"
                          name="fechaFinal"
                          value={formData.fechaFinal}
                          onChange={handleChange}
                          className="input-field h-12 text-base pl-10"
                          required
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        La fecha final se calcula automáticamente; puedes cambiarla si lo necesitas.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Observación
                    </label>
                    <textarea
                      name="observacion"
                      value={formData.observacion}
                      onChange={handleChange}
                      className="input-field text-base min-h-[100px]"
                      rows="4"
                      placeholder="Notas adicionales sobre el préstamo..."
                    />
                  </div>

                  {/* Subida de Archivos */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Archivos Adjuntos
                    </label>
                    <div className="space-y-2">
                      <label className="inline-flex items-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors touch-manipulation w-full justify-center">
                        <Upload className="mr-2" size={18} />
                        <span className="text-sm font-medium">Seleccionar Archivos</span>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          onChange={handleFileChange}
                        />
                      </label>
                      {archivos.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {archivos.map((archivo, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-2 flex-1 min-w-0">
                                <FileText className="text-gray-400 flex-shrink-0" size={18} />
                                <span className="text-sm text-gray-700 truncate">{archivo.name}</span>
                                <span className="text-xs text-gray-500 flex-shrink-0">
                                  ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveFile(index)}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors touch-manipulation flex-shrink-0 ml-2"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        Puedes subir múltiples archivos (máx. 10MB cada uno)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-200">
                <Link
                  to="/prestamos"
                  className="btn-secondary w-full sm:w-auto h-12 text-base touch-manipulation"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full sm:w-auto h-12 text-base disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Panel de Cálculos */}
        <div className="lg:col-span-1">
          <div className="card p-4 sm:p-6 sticky top-4">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Resumen de Cálculos</h2>
            </div>

            <div className="space-y-4">
              <div className="pb-3 border-b border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tipo de interés</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.tipoInteres === 'SIMPLE_GLOBAL' ? 'Simple (global)' : 'Simple por período'}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Total a Pagar</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculos.totalPagar.toLocaleString('es-CO')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Valor Cuota</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculos.valorCuota.toLocaleString('es-CO')}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Ganancia</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${calculos.ganancia.toLocaleString('es-CO')}
                  </p>
                </div>
              </div>

              {/* Información adicional */}
              {formData.montoPrestadoFormatted && formData.numeroCuotas && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Monto Prestado:</span>
                    <span className="font-semibold text-gray-900">
                      ${parseFormattedNumber(formData.montoPrestadoFormatted).toLocaleString('es-CO')}
                    </span>
                  </div>
                  {formData.interesPorcentaje && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interés Total:</span>
                      <span className="font-semibold text-gray-900">
                        {formData.interesPorcentaje}%
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Número de Cuotas:</span>
                    <span className="font-semibold text-gray-900">{formData.numeroCuotas}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

