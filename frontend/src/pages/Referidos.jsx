import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { 
  Gift, 
  Copy, 
  Share2, 
  Users, 
  DollarSign, 
  CheckCircle, 
  TrendingUp,
  QrCode,
  Download,
  Mail,
  MessageSquare,
  Award,
  Calendar,
  UserPlus
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { format } from 'date-fns'

export default function Referidos() {
  const { user } = useAuth()
  
  // Inicializar código desde localStorage si existe
  const getCodigoGuardado = () => {
    if (user?.id) {
      const codigoGuardado = localStorage.getItem(`codigoReferido_${user.id}`)
      return codigoGuardado || ''
    }
    return ''
  }
  
  const [codigoReferido, setCodigoReferido] = useState(getCodigoGuardado())
  const [referidos, setReferidos] = useState([])
  const [recompensas, setRecompensas] = useState([])
  const [estadisticas, setEstadisticas] = useState({
    totalReferidos: 0,
    referidosActivos: 0,
    totalRecompensas: 0,
    recompensasPendientes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchReferidosData()
    }
  }, [user?.id])

  const fetchReferidosData = async () => {
    try {
      setLoading(true)
      
      // Intentar cargar el código guardado desde localStorage como fallback
      const codigoGuardado = localStorage.getItem(`codigoReferido_${user?.id}`)
      
      try {
        const [codigoRes, referidosRes, recompensasRes, statsRes] = await Promise.all([
          api.get('/referidos/codigo'),
          api.get('/referidos'),
          api.get('/referidos/recompensas'),
          api.get('/referidos/estadisticas')
        ])
        
        // Guardar el código en localStorage para persistencia
        if (codigoRes.data?.codigo) {
          localStorage.setItem(`codigoReferido_${user?.id}`, codigoRes.data.codigo)
          setCodigoReferido(codigoRes.data.codigo)
        } else if (codigoGuardado) {
          setCodigoReferido(codigoGuardado)
        } else {
          setCodigoReferido(`Cargando...`)
        }
        
        setReferidos(referidosRes.data || [])
        setRecompensas(recompensasRes.data || [])
        setEstadisticas(statsRes.data || {
          totalReferidos: 0,
          referidosActivos: 0,
          totalRecompensas: 0,
          recompensasPendientes: 0
        })
      } catch (apiError) {
        // Si hay un error de API pero tenemos código guardado, usarlo
        if (codigoGuardado) {
          setCodigoReferido(codigoGuardado)
          setReferidos([])
          setRecompensas([])
          setEstadisticas({
            totalReferidos: 0,
            referidosActivos: 0,
            totalRecompensas: 0,
            recompensasPendientes: 0
          })
          toast.warning('No se pudo conectar con el servidor. Mostrando datos guardados.')
          return
        }
        throw apiError
      }
    } catch (error) {
      console.error('Error al cargar datos de referidos:', error)
      
      // Intentar usar código guardado como último recurso
      const codigoGuardado = localStorage.getItem(`codigoReferido_${user?.id}`)
      if (codigoGuardado) {
        setCodigoReferido(codigoGuardado)
        toast.warning('No se pudo conectar con el servidor. Mostrando código guardado.')
      } else {
        setCodigoReferido('Error al cargar')
        toast.error('Error al cargar datos de referidos. Verifica tu conexión.')
      }
      
      setReferidos([])
      setRecompensas([])
      setEstadisticas({
        totalReferidos: 0,
        referidosActivos: 0,
        totalRecompensas: 0,
        recompensasPendientes: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const copiarCodigo = () => {
    navigator.clipboard.writeText(codigoReferido)
    toast.success('Código copiado al portapapeles')
  }

  const compartirCodigo = async () => {
    const url = `${window.location.origin}/register?ref=${codigoReferido}`
    const texto = `¡Únete a PrestaCol usando mi código de referido: ${codigoReferido}! Obtén beneficios exclusivos. ${url}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Código de Referido PrestaCol',
          text: texto,
          url: url
        })
        toast.success('Código compartido')
      } catch (error) {
        if (error.name !== 'AbortError') {
          copiarCodigo()
        }
      }
    } else {
      copiarCodigo()
    }
  }

  const compartirPorEmail = () => {
    const url = `${window.location.origin}/register?ref=${codigoReferido}`
    const subject = encodeURIComponent('Código de Referido PrestaCol')
    const body = encodeURIComponent(`¡Únete a PrestaCol usando mi código de referido: ${codigoReferido}!\n\nObtén beneficios exclusivos al registrarte.\n\nRegístrate aquí: ${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const compartirPorWhatsApp = () => {
    const url = `${window.location.origin}/register?ref=${codigoReferido}`
    const texto = encodeURIComponent(`¡Únete a PrestaCol usando mi código de referido: ${codigoReferido}! Obtén beneficios exclusivos. ${url}`)
    window.open(`https://wa.me/?text=${texto}`, '_blank')
  }

  const generarQR = () => {
    // TODO: Implementar generación de QR
    toast.info('Generando código QR...')
  }

  const getEstadoBadge = (estado) => {
    const badges = {
      ACTIVO: 'bg-green-100 text-green-800 border-green-200',
      INACTIVO: 'bg-gray-100 text-gray-800 border-gray-200',
      PENDIENTE: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      PAGADA: 'bg-blue-100 text-blue-800 border-blue-200',
      DISPONIBLE: 'bg-purple-100 text-purple-800 border-purple-200'
    }
    return badges[estado] || badges.INACTIVO
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Programa de referidos</h1>
        <p className="text-gray-600 hidden sm:block mt-1">Comparte tu código y gana recompensas</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: 'Total referidos',
            value: estadisticas.totalReferidos,
            icon: <Users size={18} className="text-blue-600" />,
            gradient: 'from-blue-50 to-indigo-50 border-blue-200',
          },
          {
            label: 'Activos',
            value: estadisticas.referidosActivos,
            icon: <CheckCircle size={18} className="text-emerald-600" />,
            gradient: 'from-emerald-50 to-emerald-100 border-emerald-200',
          },
          {
            label: 'Total recompensas',
            value: `$${(estadisticas.totalRecompensas || 0).toLocaleString('es-CO')}`,
            icon: <DollarSign size={18} className="text-purple-600" />,
            gradient: 'from-purple-50 to-pink-50 border-purple-200',
          },
          {
            label: 'Pendientes',
            value: estadisticas.recompensasPendientes,
            icon: <Gift size={18} className="text-amber-600" />,
            gradient: 'from-amber-50 to-amber-100 border-amber-200',
          },
        ].map(({ label, value, icon, gradient }) => (
          <div
            key={label}
            className={`rounded-xl border bg-gradient-to-br px-3 py-2 sm:px-4 sm:py-3 shadow-sm flex items-center justify-between ${gradient}`}
          >
            <div className="space-y-1">
              <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wide text-gray-600">
                {label}
              </p>
              <p className="text-base sm:text-xl font-bold text-gray-900">{value}</p>
        </div>
            <div className="w-9 h-9 rounded-xl bg-white/70 backdrop-blur flex items-center justify-center">
              {icon}
        </div>
          </div>
        ))}
      </div>

      {/* Código de Referido */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Gift className="text-primary-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Tu Código de Referido</h2>
        </div>
        
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 p-5 rounded-lg border-2 border-primary-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-center sm:text-left space-y-2 w-full">
              <p className="text-sm text-gray-600">Comparte este código con tus amigos</p>
              <div className="w-full overflow-x-auto">
                <code className="block w-max max-w-full text-base sm:text-3xl font-bold text-primary-700 font-mono bg-white px-4 py-2 rounded-lg border-2 border-primary-300 mx-auto sm:mx-0 break-all">
                  {codigoReferido}
                </code>
              </div>
              <p className="text-xs text-gray-500">
                Cada persona que se registre con tu código te generará recompensas
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={copiarCodigo}
                className="btn-primary inline-flex items-center justify-center gap-2 w-full text-xs sm:text-sm"
              >
                <Copy size={16} />
                <span>Copiar</span>
              </button>
              <button
                onClick={compartirCodigo}
                className="btn-secondary inline-flex items-center justify-center gap-2 w-full text-xs sm:text-sm"
              >
                <Share2 size={16} />
                <span>Compartir</span>
              </button>
            </div>
          </div>

          {/* Opciones de Compartir */}
          <div className="pt-4 border-t border-primary-200">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 mb-3">
              Compartir por
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={compartirPorWhatsApp}
                className="flex items-center justify-center gap-2 p-3 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-green-700 font-medium text-xs sm:text-sm"
              >
                <MessageSquare size={16} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={compartirPorEmail}
                className="flex items-center justify-center gap-2 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-blue-700 font-medium text-xs sm:text-sm"
              >
                <Mail size={16} />
                <span>Email</span>
              </button>
              <button
                onClick={generarQR}
                className="flex items-center justify-center gap-2 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-purple-700 font-medium text-xs sm:text-sm"
              >
                <QrCode size={16} />
                <span>QR</span>
              </button>
              <button
                onClick={() => window.open(`/register?ref=${codigoReferido}`, '_blank')}
                className="flex items-center justify-center gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-gray-700 font-medium text-xs sm:text-sm"
              >
                <Download size={16} />
                <span>Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recompensas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Award className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Recompensas</h2>
            </div>
            <TrendingUp className="text-gray-400" size={20} />
          </div>

          {recompensas.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay recompensas disponibles</p>
          ) : (
            <div className="space-y-3">
              {recompensas.map((recompensa) => (
                <div
                  key={recompensa.id}
                  className={`p-4 rounded-lg border-2 ${
                    recompensa.estado === 'PAGADA'
                      ? 'bg-green-50 border-green-200'
                      : recompensa.estado === 'DISPONIBLE'
                      ? 'bg-purple-50 border-purple-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{recompensa.descripcion}</h3>
                      <p className="text-2xl font-bold text-primary-600">
                        ${recompensa.monto.toLocaleString('es-CO')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(recompensa.estado)}`}>
                      {recompensa.estado}
                    </span>
                  </div>
                  {recompensa.fecha && (
                    <div className="flex items-center text-xs text-gray-600 mt-2">
                      <Calendar size={14} className="mr-1" />
                      <span>Pagada el: {format(new Date(recompensa.fecha), 'dd/MM/yyyy')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Personas Referidas */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="text-primary-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Personas Referidas</h2>
            </div>
            <Users className="text-gray-400" size={20} />
          </div>

          {referidos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-lg mb-2">Aún no tienes referidos</p>
              <p className="text-gray-400 text-sm">Comparte tu código para comenzar a ganar recompensas</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {referidos.map((referido) => (
                <div
                  key={referido.id}
                  className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{referido.nombre}</h3>
                      <p className="text-sm text-gray-600">{referido.email}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getEstadoBadge(referido.estado)}`}>
                      {referido.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Fecha Registro</p>
                      <p className="text-sm font-medium text-gray-900">
                        {format(new Date(referido.fechaRegistro), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Monto Generado</p>
                      <p className="text-sm font-medium text-green-600">
                        ${referido.montoGenerado.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>

                  {referido.recompensa > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Tu Recompensa:</span>
                        <span className="text-sm font-bold text-primary-600">
                          ${referido.recompensa.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-medium border ${getEstadoBadge(referido.estadoRecompensa)}`}>
                        {referido.estadoRecompensa}
                      </span>
                    </div>
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

