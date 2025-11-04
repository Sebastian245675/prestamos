import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import { CreditCard, ArrowRight, LogIn, BarChart3, Shield, Zap } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      toast.success('¡Bienvenido!')
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado Izquierdo - Imagen de fondo */}
      <div 
        className="hidden lg:flex lg:w-1/2 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/1762215170138.webp)'
        }}
      >
      </div>

      {/* Lado Derecho - Formulario de Login con fondo azul */}
      <div className="flex-1 lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Patrones decorativos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 h-full">
          <div className="w-full max-w-lg">
            {/* Logo y título para mobile */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full mb-4">
                <CreditCard className="text-white" size={32} />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">PrestaCol</h1>
              <p className="text-white/90">Gestiona tus préstamos como un profesional</p>
            </div>

            {/* Título para desktop */}
            <div className="hidden lg:block mb-6 text-center">
              <h1 className="text-4xl font-bold text-white mb-2">Inicia sesión</h1>
              <p className="text-lg text-white/90">Accede a tu cuenta de PrestaCol</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-xl p-8 lg:p-10 border border-white/20">
              <div className="flex items-center justify-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-full">
                  <LogIn className="text-white" size={32} />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-lg text-white placeholder:text-white/60"
                    required
                    placeholder="tu@email.com"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-white/30 bg-white/10 backdrop-blur-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all text-lg text-white placeholder:text-white/60"
                    required
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-primary-600 py-4 rounded-lg font-semibold text-lg hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
                >
                  <span>{loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}</span>
                  {!loading && <ArrowRight size={20} />}
                </button>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-white/90">
                  ¿No tienes una cuenta?{' '}
                  <Link to="/register" className="text-white hover:text-white/80 font-semibold underline">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

