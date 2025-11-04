import { useState, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Plus, Edit, Trash2, UserPlus, Mail, Phone } from 'lucide-react'

export default function Cobradores() {
  const [cobradores, setCobradores] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCobrador, setEditingCobrador] = useState(null)
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    password: '',
    permisos: {
      verPrestamos: true,
      registrarAbonos: true,
      editarPrestamos: false,
      eliminarPrestamos: false,
      verReportes: false,
      gestionarClientes: false,
      verCalendario: true,
      exportarDatos: false
    }
  })

  useEffect(() => {
    fetchCobradores()
  }, [])

  const fetchCobradores = async () => {
    try {
      const mockCobradores = [
        {
          id: 1,
          nombreCompleto: 'Roberto Martínez',
          email: 'roberto@prestacol.com',
          telefono: '3001112233',
          activo: true,
          numeroPrestamos: 5,
          permisos: {
            verPrestamos: true,
            registrarAbonos: true,
            editarPrestamos: false,
            eliminarPrestamos: false,
            verReportes: false,
            gestionarClientes: false,
            verCalendario: true,
            exportarDatos: false
          }
        }
      ]
      
      try {
        const response = await axios.get('/api/cobradores')
        setCobradores(response.data)
      } catch (e) {
        setCobradores(mockCobradores)
      }
    } catch (error) {
      toast.error('Error al cargar los cobradores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingCobrador) {
        await axios.put(`/api/cobradores/${editingCobrador.id}`, formData)
        toast.success('Cobrador actualizado exitosamente')
      } else {
        if (cobradores.length >= 2) {
          toast.error('Ya has alcanzado el límite de 2 cobradores')
          return
        }
        await axios.post('/api/cobradores', formData)
        toast.success('Cobrador creado exitosamente')
      }
      
      setShowModal(false)
      setEditingCobrador(null)
      setFormData({
        nombreCompleto: '',
        email: '',
        telefono: '',
        password: '',
        permisos: {
          verPrestamos: true,
          registrarAbonos: true,
          editarPrestamos: false,
          eliminarPrestamos: false,
          verReportes: false,
          gestionarClientes: false,
          verCalendario: true,
          exportarDatos: false
        }
      })
      fetchCobradores()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al guardar el cobrador')
    }
  }

  const handleEdit = (cobrador) => {
    setEditingCobrador(cobrador)
    setFormData({
      nombreCompleto: cobrador.nombreCompleto,
      email: cobrador.email,
      telefono: cobrador.telefono,
      password: '',
      permisos: cobrador.permisos || {
        verPrestamos: true,
        registrarAbonos: true,
        editarPrestamos: false,
        eliminarPrestamos: false,
        verReportes: false,
        gestionarClientes: false,
        verCalendario: true,
        exportarDatos: false
      }
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este cobrador?')) {
      return
    }

    try {
      await axios.delete(`/api/cobradores/${id}`)
      toast.success('Cobrador eliminado exitosamente')
      fetchCobradores()
    } catch (error) {
      toast.error('Error al eliminar el cobrador')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const openModal = () => {
    setEditingCobrador(null)
    setFormData({
      nombreCompleto: '',
      email: '',
      telefono: '',
      password: '',
      permisos: {
        verPrestamos: true,
        registrarAbonos: true,
        editarPrestamos: false,
        eliminarPrestamos: false,
        verReportes: false,
        gestionarClientes: false,
        verCalendario: true,
        exportarDatos: false
      }
    })
    setShowModal(true)
  }

  const handlePermisoChange = (permiso) => {
    setFormData({
      ...formData,
      permisos: {
        ...formData.permisos,
        [permiso]: !formData.permisos[permiso]
      }
    })
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
          <h1 className="text-3xl font-bold text-gray-900">Cobradores</h1>
          <p className="text-gray-600 mt-1">Gestiona tus cobradores (máximo 2)</p>
        </div>
        <button
          onClick={openModal}
          disabled={cobradores.length >= 2}
          className="mt-4 sm:mt-0 btn-primary inline-flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          <span>Nuevo Cobrador</span>
        </button>
      </div>

      {/* Cobradores List */}
      {cobradores.length === 0 ? (
        <div className="card text-center py-12">
          <UserPlus className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg mb-2">No tienes cobradores registrados</p>
          <p className="text-gray-500 mb-4">Puedes crear hasta 2 cobradores para gestionar tus préstamos</p>
          <button onClick={openModal} className="btn-primary">
            Crear Primer Cobrador
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cobradores.map((cobrador) => (
            <div key={cobrador.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <UserPlus className="text-primary-600" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {cobrador.nombreCompleto}
                    </h3>
                    <p className={`text-sm ${cobrador.activo ? 'text-green-600' : 'text-red-600'}`}>
                      {cobrador.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(cobrador)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(cobrador.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail size={16} className="mr-2" />
                  <span>{cobrador.email}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone size={16} className="mr-2" />
                  <span>{cobrador.telefono}</span>
                </div>
              </div>

              {cobrador.numeroPrestamos !== undefined && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Préstamos asignados: <strong className="text-gray-900">{cobrador.numeroPrestamos}</strong>
                  </p>
                  {cobrador.permisos && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Permisos:</p>
                      <div className="flex flex-wrap gap-2">
                        {cobrador.permisos.verPrestamos && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Ver Préstamos</span>
                        )}
                        {cobrador.permisos.registrarAbonos && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Registrar Abonos</span>
                        )}
                        {cobrador.permisos.editarPrestamos && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Editar</span>
                        )}
                        {cobrador.permisos.verCalendario && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Calendario</span>
                        )}
                        {cobrador.permisos.verReportes && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Reportes</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {editingCobrador ? 'Editar Cobrador' : 'Nuevo Cobrador'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="cobrador@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input-field"
                  required
                  placeholder="3001234567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña {!editingCobrador && '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  required={!editingCobrador}
                  minLength={6}
                  placeholder={editingCobrador ? 'Dejar en blanco para no cambiar' : '••••••••'}
                />
                {editingCobrador && (
                  <p className="text-xs text-gray-500 mt-1">Deja en blanco para mantener la contraseña actual</p>
                )}
              </div>

              {/* Permisos */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Permisos</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Selecciona los permisos que tendrá este cobrador
                </p>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Ver Préstamos</p>
                      <p className="text-xs text-gray-600">Puede ver los préstamos asignados</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.verPrestamos}
                      onChange={() => handlePermisoChange('verPrestamos')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Registrar Abonos</p>
                      <p className="text-xs text-gray-600">Puede registrar pagos y abonos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.registrarAbonos}
                      onChange={() => handlePermisoChange('registrarAbonos')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Editar Préstamos</p>
                      <p className="text-xs text-gray-600">Puede modificar información de préstamos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.editarPrestamos}
                      onChange={() => handlePermisoChange('editarPrestamos')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Eliminar Préstamos</p>
                      <p className="text-xs text-gray-600">Puede eliminar préstamos (peligroso)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.eliminarPrestamos}
                      onChange={() => handlePermisoChange('eliminarPrestamos')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Ver Calendario</p>
                      <p className="text-xs text-gray-600">Puede ver el calendario de cobros</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.verCalendario}
                      onChange={() => handlePermisoChange('verCalendario')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Ver Reportes</p>
                      <p className="text-xs text-gray-600">Puede acceder a reportes y estadísticas</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.verReportes}
                      onChange={() => handlePermisoChange('verReportes')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Gestionar Clientes</p>
                      <p className="text-xs text-gray-600">Puede crear y editar clientes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.gestionarClientes}
                      onChange={() => handlePermisoChange('gestionarClientes')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                    <div>
                      <p className="font-medium text-gray-900">Exportar Datos</p>
                      <p className="text-xs text-gray-600">Puede descargar reportes en PDF/Excel</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.permisos.exportarDatos}
                      onChange={() => handlePermisoChange('exportarDatos')}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                  </label>
                </div>

                {/* Botones rápidos */}
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        permisos: {
                          verPrestamos: true,
                          registrarAbonos: true,
                          editarPrestamos: false,
                          eliminarPrestamos: false,
                          verReportes: false,
                          gestionarClientes: false,
                          verCalendario: true,
                          exportarDatos: false
                        }
                      })
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Permisos Básicos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        permisos: {
                          verPrestamos: true,
                          registrarAbonos: true,
                          editarPrestamos: true,
                          eliminarPrestamos: false,
                          verReportes: true,
                          gestionarClientes: true,
                          verCalendario: true,
                          exportarDatos: true
                        }
                      })
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Todos los Permisos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        ...formData,
                        permisos: {
                          verPrestamos: false,
                          registrarAbonos: false,
                          editarPrestamos: false,
                          eliminarPrestamos: false,
                          verReportes: false,
                          gestionarClientes: false,
                          verCalendario: false,
                          exportarDatos: false
                        }
                      })
                    }}
                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    Sin Permisos
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setEditingCobrador(null)
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingCobrador ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

