import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { HelpCircle, Mail, MessageSquare, Phone, Send, FileText, Book, AlertCircle } from 'lucide-react'

export default function Soporte() {
  const [activeTab, setActiveTab] = useState('contacto')
  const [formData, setFormData] = useState({
    asunto: '',
    tipo: 'CONSULTA',
    mensaje: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Mensaje enviado exitosamente. Te responderemos pronto.')
      setFormData({
        asunto: '',
        tipo: 'CONSULTA',
        mensaje: '',
        email: ''
      })
    } catch (error) {
      toast.error('Error al enviar el mensaje')
    } finally {
      setLoading(false)
    }
  }

  const faqs = [
    {
      pregunta: '¿Cómo registro un nuevo préstamo?',
      respuesta: 'Ve a la sección de Préstamos y haz clic en "Nuevo Préstamo". Completa el formulario con la información del cliente y los detalles del préstamo.'
    },
    {
      pregunta: '¿Cómo registro un abono?',
      respuesta: 'Ve al detalle del préstamo y haz clic en "Registrar Abono". Ingresa el monto y la fecha del pago.'
    },
    {
      pregunta: '¿Puedo tener más de 2 cobradores?',
      respuesta: 'El plan actual permite hasta 2 cobradores. Si necesitas más, contacta con soporte para actualizar tu plan.'
    },
    {
      pregunta: '¿Cómo cambio mi suscripción?',
      respuesta: 'Ve a tu perfil, sección de Suscripción, y selecciona el plan que deseas. Puedes cambiar entre mensual y anual en cualquier momento.'
    },
    {
      pregunta: '¿Cómo exporto mis reportes?',
      respuesta: 'En la sección de Reportes, puedes hacer clic en los botones "PDF" o "Excel" para descargar tus reportes.'
    },
    {
      pregunta: '¿Cómo gestiono las notificaciones?',
      respuesta: 'Ve a tu perfil, sección de Notificaciones, y configura qué tipo de alertas deseas recibir.'
    }
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Soporte</h1>
        <p className="text-gray-600 mt-1">Estamos aquí para ayudarte</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar de Tabs */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            <button
              onClick={() => setActiveTab('contacto')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'contacto'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Mail size={20} />
              <span>Contactar</span>
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'faq'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <HelpCircle size={20} />
              <span>Preguntas Frecuentes</span>
            </button>
            <button
              onClick={() => setActiveTab('recursos')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'recursos'
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Book size={20} />
              <span>Recursos</span>
            </button>
          </div>

          {/* Información de Contacto */}
          <div className="card mt-4">
            <h3 className="font-semibold text-gray-900 mb-4">Información de Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Mail size={18} className="text-primary-600" />
                <span>soporte@prestacol.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <Phone size={18} className="text-primary-600" />
                <span>+57 3186218792</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <MessageSquare size={18} className="text-primary-600" />
                <span>WhatsApp: +57 3186218792</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Horario de atención: Lunes a Viernes 8:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          {/* Contacto */}
          {activeTab === 'contacto' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contactar Soporte</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipo de Consulta *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="CONSULTA">Consulta General</option>
                    <option value="PROBLEMA">Reportar un Problema</option>
                    <option value="SUSCRIPCION">Suscripción</option>
                    <option value="FUNCIONALIDAD">Solicitar Funcionalidad</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Asunto *
                  </label>
                  <input
                    type="text"
                    value={formData.asunto}
                    onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                    className="input-field"
                    required
                    placeholder="Ej: Problema al registrar un abono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tu Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field"
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mensaje *
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                    className="input-field"
                    required
                    rows="6"
                    placeholder="Describe tu consulta o problema en detalle..."
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Tiempo de Respuesta</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Nos comprometemos a responder en un plazo máximo de 24 horas hábiles.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary inline-flex items-center space-x-2 disabled:opacity-50"
                  >
                    <Send size={18} />
                    <span>{loading ? 'Enviando...' : 'Enviar Mensaje'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Preguntas Frecuentes</h2>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors"
                  >
                    <summary className="flex items-center justify-between cursor-pointer">
                      <h3 className="font-medium text-gray-900">{faq.pregunta}</h3>
                      <span className="text-primary-600 group-open:rotate-180 transition-transform">
                        ▼
                      </span>
                    </summary>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">{faq.respuesta}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Recursos */}
          {activeTab === 'recursos' && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recursos y Guías</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <FileText className="text-primary-600 mb-3" size={32} />
                    <h3 className="font-semibold text-gray-900 mb-2">Guía de Inicio Rápido</h3>
                    <p className="text-sm text-gray-600">
                      Aprende a usar PrestaCol en 5 minutos
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <Book className="text-primary-600 mb-3" size={32} />
                    <h3 className="font-semibold text-gray-900 mb-2">Manual de Usuario</h3>
                    <p className="text-sm text-gray-600">
                      Documentación completa de todas las funcionalidades
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <MessageSquare className="text-primary-600 mb-3" size={32} />
                    <h3 className="font-semibold text-gray-900 mb-2">Tutoriales en Video</h3>
                    <p className="text-sm text-gray-600">
                      Videos explicativos paso a paso
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer">
                    <HelpCircle className="text-primary-600 mb-3" size={32} />
                    <h3 className="font-semibold text-gray-900 mb-2">Centro de Ayuda</h3>
                    <p className="text-sm text-gray-600">
                      Artículos y soluciones a problemas comunes
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Versión de la Aplicación</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><strong className="text-gray-900">Versión:</strong> 1.0.0</p>
                  <p><strong className="text-gray-900">Última actualización:</strong> {new Date().toLocaleDateString('es-CO')}</p>
                  <p><strong className="text-gray-900">Estado:</strong> <span className="text-green-600">Operativo</span></p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

