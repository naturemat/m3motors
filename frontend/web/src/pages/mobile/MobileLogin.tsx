import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Phone } from 'lucide-react'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function MobileLogin() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    setError(null)

    try {
      const result = await axios.post(`${apiUrl}/auth/login-mobile`, {
        email,
        password,
      })

      if (result.data.success) {
        localStorage.setItem('mobile_user', JSON.stringify({
          userId: result.data.userId,
          role: result.data.role,
          name: result.data.name,
          workshopId: result.data.workshopId,
          token: result.data.token,
        }))

        if (result.data.role === 'mechanic') {
          navigate('/mobile/mechanic')
        } else {
          navigate('/mobile/client')
        }
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al iniciar sesion'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !nombre || !telefono) return

    setLoading(true)
    setError(null)

    try {
      const result = await axios.post(`${apiUrl}/auth/register`, {
        email,
        password,
        nombre,
        telefono,
      })

      if (result.data.success) {
        localStorage.setItem('mobile_user', JSON.stringify({
          userId: result.data.user.userId,
          role: result.data.user.role,
          name: result.data.user.name,
          workshopId: result.data.user.workshopId,
          token: result.data.token,
        }))
        navigate('/mobile/client')
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al registrarse'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const isLogin = mode === 'login'
  const isValid = isLogin
    ? email && password
    : email && password && nombre && telefono

  return (
    <div className="min-h-screen bg-[#F4F6F7]">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1A5276] to-[#154360] text-white px-5 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-lg font-bold">
            {isLogin ? 'Iniciar Sesion' : 'Crear Cuenta'}
          </h1>
        </div>
        <p className="text-xs text-[#D6EAF8]">
          {isLogin
            ? 'Ingresa tus credenciales para acceder a tu cuenta.'
            : 'Registrate para acceder a tu cuenta de cliente.'}
        </p>
      </header>

      {/* Toggle */}
      <div className="px-5 pt-4">
        <div className="flex bg-[#E2E8F0] rounded-xl p-1">
          <button
            onClick={() => { setMode('login'); setError(null) }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              isLogin ? 'bg-white text-[#1A5276] shadow-sm' : 'text-[#5D6D7E]'
            }`}
          >
            Iniciar Sesion
          </button>
          <button
            onClick={() => { setMode('register'); setError(null) }}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              !isLogin ? 'bg-white text-[#1A5276] shadow-sm' : 'text-[#5D6D7E]'
            }`}
          >
            Registrarse
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="px-5 py-5">
        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          {/* Register-only fields */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D6D7E]" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    required
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1.5">
                  Telefono
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D6D7E]" />
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="0991234567"
                    required
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1.5">
              Correo Electronico
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D6D7E]" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1.5">
              Contrasena
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#5D6D7E]" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? 'Tu contrasena' : 'Minimo 6 caracteres'}
                required
                className="w-full bg-white border border-[#E2E8F0] rounded-xl pl-10 pr-12 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5D6D7E]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-[#FDEDEC] border border-[#E74C3C]/20 rounded-xl p-3">
              <p className="text-xs text-[#E74C3C]">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              loading || !isValid
                ? 'bg-[#E2E8F0] text-[#5D6D7E]'
                : 'bg-[#1A5276] text-white active:scale-95'
            }`}
          >
            {loading
              ? (isLogin ? 'Iniciando sesion...' : 'Creando cuenta...')
              : (isLogin ? 'Iniciar Sesion' : 'Crear Cuenta')}
          </button>
        </form>

        {isLogin && (
          <div className="mt-6 text-center">
            <p className="text-[10px] text-[#5D6D7E]">
              No tienes cuenta?{' '}
              <button
                onClick={() => { setMode('register'); setError(null) }}
                className="text-[#1A5276] font-bold"
              >
                Registrate aqui
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
