import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import { toast } from 'react-toastify'
import { User, Mail, Phone, Calendar, CreditCard, Shield, Save, Edit2, Lock, Bell } from 'lucide-react'

export default function Perfil() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('personal')
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [loadingSuscripcion, setLoadingSuscripcion] = useState(true)

  // Datos del perfil
  const [perfilData, setPerfilData] = useState({
    nombreCompleto: user?.nombreCompleto || 'Usuario Demo',
    email: user?.email || 'usuario@prestacol.com',
    telefono: user?.telefono || '3001234567',
    fechaNacimiento: '1990-01-01',
    direccion: 'Calle 123 #45-67',
    ciudad: 'Bogotá',
    documento: '1234567890',
    tipoDocumento: 'CC'
  })

  // Datos de suscripción
  const [suscripcion, setSuscripcion] = useState({
    tipo: 'MENSUAL',
    fechaInicio: null,
    fechaVencimiento: null,
    estado: 'SIN_SUSCRIPCION',
    monto: 40000,
    montoCOP: 40000
  })

  // Cargar datos de suscripción
  useEffect(() => {
    const cargarSuscripcion = async () => {
      try {
        setLoadingSuscripcion(true)
        const response = await api.get('/suscripciones')
        if (response.data && response.data.tipo) {
          setSuscripcion({
            tipo: response.data.tipo,
            fechaInicio: response.data.fechaInicio,
            fechaVencimiento: response.data.fechaVencimiento,
            estado: response.data.estado,
            monto: response.data.montoCOP ? parseFloat(response.data.montoCOP) : (response.data.tipo === 'ANUAL' ? 432000 : 40000),
            montoCOP: response.data.montoCOP ? parseFloat(response.data.montoCOP) : (response.data.tipo === 'ANUAL' ? 432000 : 40000)
          })
        }
      } catch (error) {
        console.error('Error al cargar suscripción:', error)
        // Mantener valores por defecto
      } finally {
        setLoadingSuscripcion(false)
      }
    }

    if (user) {
      cargarSuscripcion()
    }
  }, [user])

  // Cambio de contraseña
  const [passwordData, setPasswordData] = useState({
    contraseñaActual: '',
    nuevaContraseña: '',
    confirmarContraseña: ''
  })

  // Configuración de notificaciones
  const [notificaciones, setNotificaciones] = useState({
    emailNotificaciones: true,
    recordatoriosCobro: true,
    alertasVencimiento: true,
    notificacionesPago: true,
    resumenDiario: false,
    resumenSemanal: true
  })

  const handleSavePerfil = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simular guardado
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Perfil actualizado exitosamente')
      setEditMode(false)
    } catch (error) {
      toast.error('Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()

    if (passwordData.nuevaContraseña !== passwordData.confirmarContraseña) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.nuevaContraseña.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Contraseña actualizada exitosamente')
      setPasswordData({
        contraseñaActual: '',
        nuevaContraseña: '',
        confirmarContraseña: ''
      })
    } catch (error) {
      toast.error('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotificaciones = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Configuración de notificaciones guardada')
    } catch (error) {
      toast.error('Error al guardar configuración')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600 mt-1">Gestiona tu información personal y configuración</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            <button
              onClick={() => setActiveTab('personal')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'personal'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <User size={20} />
              <span>Información Personal</span>
            </button>
            <button
              onClick={() => setActiveTab('suscripcion')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'suscripcion'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <CreditCard size={20} />
              <span>Suscripción</span>
            </button>
            <button
              onClick={() => setActiveTab('seguridad')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'seguridad'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Shield size={20} />
              <span>Seguridad</span>
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'notificaciones'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Bell size={20} />
              <span>Notificaciones</span>
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          {/* Información Personal */}
          {activeTab === 'personal' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
                {!editMode ? (
                  <button
                    onClick={() => setEditMode(true)}
                    className="btn-secondary inline-flex items-center space-x-2"
                  >
                    <Edit2 size={18} />
                    <span>Editar</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setEditMode(false)}
                    className="btn-secondary"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              <form onSubmit={handleSavePerfil} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={perfilData.nombreCompleto}
                        onChange={(e) => setPerfilData({ ...perfilData, nombreCompleto: e.target.value })}
                        className="input-field pl-10"
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Electrónico *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={perfilData.email}
                        onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                        className="input-field pl-10"
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        value={perfilData.telefono}
                        onChange={(e) => setPerfilData({ ...perfilData, telefono: e.target.value })}
                        className="input-field pl-10"
                        disabled={!editMode}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Nacimiento
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="date"
                        value={perfilData.fechaNacimiento}
                        onChange={(e) => setPerfilData({ ...perfilData, fechaNacimiento: e.target.value })}
                        className="input-field pl-10"
                        disabled={!editMode}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Documento
                    </label>
                    <select
                      value={perfilData.tipoDocumento}
                      onChange={(e) => setPerfilData({ ...perfilData, tipoDocumento: e.target.value })}
                      className="input-field"
                      disabled={!editMode}
                    >
                      <option value="CC">Cédula de Ciudadanía</option>
                      <option value="CE">Cédula de Extranjería</option>
                      <option value="NIT">NIT</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Documento
                    </label>
                    <input
                      type="text"
                      value={perfilData.documento}
                      onChange={(e) => setPerfilData({ ...perfilData, documento: e.target.value })}
                      className="input-field"
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={perfilData.direccion}
                      onChange={(e) => setPerfilData({ ...perfilData, direccion: e.target.value })}
                      className="input-field"
                      disabled={!editMode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={perfilData.ciudad}
                      onChange={(e) => setPerfilData({ ...perfilData, ciudad: e.target.value })}
                      className="input-field"
                      disabled={!editMode}
                    />
                  </div>
                </div>

                {editMode && (
                  <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Save size={18} />
                      <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Suscripción */}
          {activeTab === 'suscripcion' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Suscripción</h2>

              <div className="space-y-6">
                <div className={`p-6 rounded-lg border-2 ${
                  suscripcion.estado === 'ACTIVA'
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Plan {suscripcion.tipo === 'MENSUAL' ? 'Mensual' : 'Anual'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Estado: <span className={`font-medium ${
                          suscripcion.estado === 'ACTIVA' ? 'text-green-700' : 
                          suscripcion.estado === 'SIN_SUSCRIPCION' ? 'text-gray-700' : 'text-red-700'
                        }`}>
                          {suscripcion.estado === 'ACTIVA' ? 'Activa' : 
                           suscripcion.estado === 'SIN_SUSCRIPCION' ? 'Sin Suscripción' : 'Vencida'}
                        </span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${suscripcion.monto?.toLocaleString('es-CO')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {suscripcion.tipo === 'MENSUAL' ? '/mes' : '/año'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Inicio</p>
                      <p className="font-medium text-gray-900">
                        {suscripcion.fechaInicio 
                          ? new Date(suscripcion.fechaInicio).toLocaleDateString('es-CO')
                          : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha de Vencimiento</p>
                      <p className="font-medium text-gray-900">
                        {suscripcion.fechaVencimiento 
                          ? new Date(suscripcion.fechaVencimiento).toLocaleDateString('es-CO')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cambiar Plan</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      suscripcion.tipo === 'MENSUAL'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Plan Mensual</h4>
                        {suscripcion.tipo === 'MENSUAL' && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">$40.000</p>
                      <p className="text-sm text-gray-600">/mes</p>
                    </div>

                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      suscripcion.tipo === 'ANUAL'
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Plan Anual</h4>
                        {suscripcion.tipo === 'ANUAL' && (
                          <span className="px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">$432.000</p>
                      <p className="text-sm text-gray-600">/año</p>
                      <p className="text-xs text-green-600 mt-1">Ahorras $48.000</p>
                    </div>
                  </div>
                  <button className="mt-4 btn-primary">
                    Actualizar Suscripción
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seguridad */}
          {activeTab === 'seguridad' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Seguridad</h2>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña Actual *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.contraseñaActual}
                      onChange={(e) => setPasswordData({ ...passwordData, contraseñaActual: e.target.value })}
                      className="input-field pl-10"
                      required
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.nuevaContraseña}
                      onChange={(e) => setPasswordData({ ...passwordData, nuevaContraseña: e.target.value })}
                      className="input-field pl-10"
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Nueva Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="password"
                      value={passwordData.confirmarContraseña}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmarContraseña: e.target.value })}
                      className="input-field pl-10"
                      required
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Requisitos de contraseña:</strong>
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 list-disc list-inside space-y-1">
                    <li>Mínimo 6 caracteres</li>
                    <li>Se recomienda usar mayúsculas, minúsculas y números</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notificaciones */}
          {activeTab === 'notificaciones' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Configuración de Notificaciones</h2>
                <button
                  onClick={handleSaveNotificaciones}
                  disabled={loading}
                  className="btn-primary disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notificaciones por Email</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Recibir notificaciones por email</p>
                        <p className="text-sm text-gray-600">Recibe alertas importantes en tu correo</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.emailNotificaciones}
                        onChange={(e) => setNotificaciones({ ...notificaciones, emailNotificaciones: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Recordatorios de cobro</p>
                        <p className="text-sm text-gray-600">Notificaciones cuando hay cobros pendientes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.recordatoriosCobro}
                        onChange={(e) => setNotificaciones({ ...notificaciones, recordatoriosCobro: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Alertas de vencimiento</p>
                        <p className="text-sm text-gray-600">Avisos cuando un préstamo está próximo a vencer</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.alertasVencimiento}
                        onChange={(e) => setNotificaciones({ ...notificaciones, alertasVencimiento: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Notificaciones de pago</p>
                        <p className="text-sm text-gray-600">Avisos cuando se registran abonos</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.notificacionesPago}
                        onChange={(e) => setNotificaciones({ ...notificaciones, notificacionesPago: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resúmenes</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Resumen diario</p>
                        <p className="text-sm text-gray-600">Recibe un resumen de actividad todos los días</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.resumenDiario}
                        onChange={(e) => setNotificaciones({ ...notificaciones, resumenDiario: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <div>
                        <p className="font-medium text-gray-900">Resumen semanal</p>
                        <p className="text-sm text-gray-600">Recibe un resumen de actividad cada semana</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificaciones.resumenSemanal}
                        onChange={(e) => setNotificaciones({ ...notificaciones, resumenSemanal: e.target.checked })}
                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

