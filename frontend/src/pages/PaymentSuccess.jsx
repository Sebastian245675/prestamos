import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-toastify'
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react'

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { confirmPayment } = useAuth()
  const [status, setStatus] = useState('processing') // processing, success, error
  
  useEffect(() => {
    const confirmarPago = async () => {
      try {
        // Obtener orderId de la URL o localStorage
        let orderId = searchParams.get('token') || searchParams.get('orderId')
        
        // Si no está en la URL, intentar obtener de localStorage
        if (!orderId) {
          orderId = localStorage.getItem('pendingOrderId')
        }
        
        if (!orderId) {
          setStatus('error')
          toast.error('No se pudo encontrar la información del pago')
          return
        }
        
        // Confirmar el pago
        const result = await confirmPayment(orderId)
        
        if (result.success) {
          setStatus('success')
          toast.success('¡Pago confirmado! Tu registro se ha completado exitosamente.')
          
          // Limpiar orderId pendiente
          localStorage.removeItem('pendingOrderId')
          
          // Redirigir al dashboard después de 2 segundos
          setTimeout(() => {
            navigate('/dashboard')
          }, 2000)
        } else {
          setStatus('error')
          toast.error(result.error || 'Error al confirmar el pago')
        }
      } catch (error) {
        setStatus('error')
        toast.error('Error al procesar el pago. Por favor contacta soporte.')
        console.error('Error al confirmar pago:', error)
      }
    }
    
    confirmarPago()
  }, [searchParams, confirmPayment, navigate])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                  <Loader2 className="text-primary-600 animate-spin" size={40} />
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Procesando tu pago...
            </h2>
            <p className="text-gray-600 mb-6">
              Por favor espera mientras confirmamos tu pago y completamos tu registro.
            </p>
            <div className="animate-pulse">
              <div className="h-2 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
            </div>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="text-green-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pago Confirmado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu registro se ha completado exitosamente. Redirigiendo al dashboard...
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Ir al Dashboard</span>
              <ArrowRight size={20} />
            </button>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="text-red-600" size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Error al Procesar el Pago
            </h2>
            <p className="text-gray-600 mb-6">
              Hubo un problema al confirmar tu pago. Por favor verifica tu cuenta o contacta soporte.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/register')}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Intentar de Nuevo
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Ir al Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

