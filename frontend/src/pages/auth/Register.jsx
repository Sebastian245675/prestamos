import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { CreditCard, TrendingUp, Shield, Zap, ArrowRight, ArrowLeft, Lock, Gift, CheckCircle, BarChart3, Calendar, Users, FileText, Bell, DollarSign, XCircle } from 'lucide-react'
import api from '../../utils/api'

export default function Register() {
  const [step, setStep] = useState(1)
  const [showCodigoReferido, setShowCodigoReferido] = useState(false)
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    codigoReferido: '',
    password: '',
    confirmPassword: '',
    tipoSuscripcion: 'MENSUAL'
  })
  const [loading, setLoading] = useState(false)
  const [codigoValido, setCodigoValido] = useState(null) // null = no validado, true = válido, false = inválido
  const [validandoCodigo, setValidandoCodigo] = useState(false)
  const timeoutRef = useRef(null)
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Validar código de referido en tiempo real
  const validarCodigoReferido = async (codigo) => {
    // Si el código está vacío, resetear validación
    if (!codigo || codigo.trim() === '') {
      setCodigoValido(null)
      return
    }

    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Esperar 500ms después de que el usuario deje de escribir (debounce)
    timeoutRef.current = setTimeout(async () => {
      setValidandoCodigo(true)
      try {
        const response = await api.get(`/public/validar-codigo-referido/${codigo.trim().toUpperCase()}`)
        setCodigoValido(response.data.valido)
        if (!response.data.valido) {
          // No mostrar toast aquí, solo mostrar error visual
        }
      } catch (error) {
        setCodigoValido(false)
      } finally {
        setValidandoCodigo(false)
      }
    }, 500)
  }

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Obtener código de referido de la URL si existe
  useEffect(() => {
    const refCode = searchParams.get('ref')
    if (refCode) {
      setFormData(prev => ({ ...prev, codigoReferido: refCode }))
      setShowCodigoReferido(true) // Mostrar el campo si viene código en la URL
      // Validar el código que viene de la URL
      validarCodigoReferido(refCode)
    }
  }, [searchParams])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Si es el campo de código de referido, validar en tiempo real
    if (name === 'codigoReferido') {
      setCodigoValido(null) // Resetear validación mientras escribe
      validarCodigoReferido(value)
    }
  }

  const handleNext = () => {
    // Validar campos del paso 1 antes de avanzar
    if (!formData.nombreCompleto || !formData.email || !formData.telefono) {
      toast.error('Por favor completa todos los campos obligatorios')
      return
    }

    // Si hay código de referido ingresado, validar que sea válido
    if (formData.codigoReferido && formData.codigoReferido.trim() !== '') {
      if (codigoValido === false) {
        toast.error('El código de referido ingresado no es válido. Por favor verifica el código.')
        return
      }
      if (codigoValido === null && validandoCodigo) {
        toast.error('Por favor espera mientras validamos el código de referido.')
        return
      }
    }

    setStep(2)
  }

  const handleNext2 = () => {
    // Validar campos del paso 2 antes de avanzar
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Por favor completa las contraseñas')
      return
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    setStep(3)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que las contraseñas coincidan (por si acaso)
    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    setLoading(true)

    const result = await register({
      nombreCompleto: formData.nombreCompleto,
      email: formData.email,
      telefono: formData.telefono,
      password: formData.password,
      tipoSuscripcion: formData.tipoSuscripcion,
      codigoReferido: formData.codigoReferido || null
    })
    
    if (result.success) {
      toast.success('¡Registro exitoso!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Imagen/Ilustración */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Patrones decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-8 h-full overflow-hidden">
          {/* Header */}
          <div className="mb-6 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mb-5 shadow-xl border border-white/20">
              <CreditCard className="text-white" size={40} />
            </div>
            <h2 className="text-4xl font-bold mb-2 leading-tight">Únete a PrestaCol</h2>
            <p className="text-xl text-white/90 font-medium">
              La plataforma más completa para gestionar tus préstamos
            </p>
          </div>

          {/* Beneficios principales - Más compactos */}
          <div className="space-y-3 w-full max-w-xl">
            {/* Beneficio 1 */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-0.5 text-white">Control Total</h3>
                  <p className="text-white/85 text-xs leading-snug">
                    Gestiona todos tus préstamos desde un solo lugar
                  </p>
                </div>
              </div>
            </div>

            {/* Beneficio 2 */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-0.5 text-white">100% Seguro</h3>
                  <p className="text-white/85 text-xs leading-snug">
                    Encriptación de nivel bancario para proteger tus datos
                  </p>
                </div>
              </div>
            </div>

            {/* Beneficio 3 */}
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <Zap className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-base mb-0.5 text-white">Rápido y Fácil</h3>
                  <p className="text-white/85 text-xs leading-snug">
                    Interfaz intuitiva para gestionar tu negocio en minutos
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas compactas */}
          <div className="mt-6 flex items-center justify-center space-x-6 pt-4 border-t border-white/20">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-white/80 uppercase tracking-wide">Disponible</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">100%</div>
              <div className="text-xs text-white/80 uppercase tracking-wide">Seguro</div>
            </div>
            <div className="w-px h-8 bg-white/20"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">∞</div>
              <div className="text-xs text-white/80 uppercase tracking-wide">Préstamos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Derecho - Formulario */}
      <div className="flex-1 lg:w-1/2 flex items-start justify-center p-4 sm:p-8 lg:pt-4 lg:pb-8 lg:px-12 bg-gray-50">
        <div className="w-full max-w-lg lg:pt-4">
          {/* Logo y título para mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
              <CreditCard className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
            <p className="text-gray-600">Únete a PrestaCol</p>
          </div>

          {/* Título para desktop */}
          <div className="hidden lg:block mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Comienza ahora</h1>
            <p className="text-base text-gray-600">Crea tu cuenta y empieza a gestionar tus préstamos</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
            {/* Indicador de pasos */}
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <div className={`w-12 h-1 transition-all ${
                  step >= 2 ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <Lock size={16} />
                </div>
                <div className={`w-12 h-1 transition-all ${
                  step >= 3 ? 'bg-primary-600' : 'bg-gray-200'
                }`}></div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <CheckCircle size={16} />
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Paso 1: Información Personal */}
              {step === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="nombreCompleto"
                      value={formData.nombreCompleto}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      required
                      placeholder="Juan Pérez"
                      autoFocus
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      required
                      placeholder="juansalazat100@gmail.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      required
                      placeholder="3001234567"
                    />
                  </div>

                  {/* Desplegable para código de referido */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowCodigoReferido(!showCodigoReferido)}
                      className="flex items-center space-x-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      <Gift size={16} />
                      <span>¿Tienes un código de referido?</span>
                      {showCodigoReferido ? (
                        <span className="text-xs">(Ocultar)</span>
                      ) : (
                        <span className="text-xs">(Mostrar)</span>
                      )}
                    </button>
                    
                    {showCodigoReferido && (
                      <div className="mt-3 animate-fadeIn">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Código de Referido
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            name="codigoReferido"
                            value={formData.codigoReferido}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all text-lg ${
                              codigoValido === true 
                                ? 'border-green-500 focus:ring-green-500 bg-green-50' 
                                : codigoValido === false 
                                ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                                : 'border-gray-300 focus:ring-primary-500'
                            }`}
                            placeholder="Ej: REF-000001-A1B2C3"
                            autoFocus
                          />
                          {validandoCodigo && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                            </div>
                          )}
                          {codigoValido === true && !validandoCodigo && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <CheckCircle className="text-green-500" size={20} />
                            </div>
                          )}
                          {codigoValido === false && !validandoCodigo && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <XCircle className="text-red-500" size={20} />
                            </div>
                          )}
                        </div>
                        {codigoValido === true && (
                          <p className="text-xs text-green-600 mt-1 flex items-center space-x-1">
                            <CheckCircle size={12} />
                            <span>Código válido</span>
                          </p>
                        )}
                        {codigoValido === false && (
                          <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                            <XCircle size={12} />
                            <span>Código de referido no encontrado. Verifica el código.</span>
                          </p>
                        )}
                        {codigoValido === null && formData.codigoReferido.trim() === '' && (
                          <p className="text-xs text-gray-500 mt-1">Ingresa tu código de referido si tienes uno</p>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                  >
                    <span>Siguiente</span>
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* Paso 2: Contraseña */}
              {step === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <Lock className="text-primary-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Crea una contraseña segura</h3>
                    <p className="text-gray-600">Protege tu cuenta con una contraseña fuerte</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      required
                      placeholder="••••••••"
                      minLength={6}
                      autoFocus
                    />
                    <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-lg"
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowLeft size={18} />
                      <span>Volver</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleNext2}
                      className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                    >
                      <span>Siguiente</span>
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Tipo de Suscripción */}
              {step === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                      <CheckCircle className="text-primary-600" size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Elige tu plan</h3>
                    <p className="text-gray-600">Selecciona el plan que mejor se adapte a tus necesidades</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tipo de Suscripción
                    </label>
                    <select
                      name="tipoSuscripcion"
                      value={formData.tipoSuscripcion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white text-lg"
                      required
                      autoFocus
                    >
                      <option value="MENSUAL">Mensual - $30.000/mes</option>
                      <option value="ANUAL">Anual - $270.000/año (Ahorras $90.000)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                      {formData.tipoSuscripcion === 'MENSUAL' 
                        ? 'Pago mensual recurrente de $30.000'
                        : 'Ahorra $90.000 pagando el año completo'
                      }
                    </p>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 py-3 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowLeft size={18} />
                      <span>Volver</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-primary-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-primary-500/30"
                    >
                      <span>{loading ? 'Registrando...' : 'Crear Cuenta'}</span>
                      {!loading && <ArrowRight size={20} />}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

