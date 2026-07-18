import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function MobileLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
        console.log('[MobileLogin] Login successful:', result.data)
        // Guardar datos del usuario y token en localStorage
        const token = `mobile:::${result.data.userId}:::m3motors`
        localStorage.setItem('mobile_user', JSON.stringify({
          userId: result.data.userId,
          role: result.data.role,
          name: result.data.name,
          workshopId: result.data.workshopId,
          token: token,
        }))
        // Redirigir segun rol
        if (result.data.role === 'mechanic') {
          navigate('/mobile/mechanic')
        } else {
          navigate('/mobile/client')
        }
      } else {
        setError('Credenciales incorrectas')
      }
    } catch (err: any) {
      console.error('[MobileLogin] Error:', err)
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al iniciar sesion'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

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
          <h1 className="text-lg font-bold">Iniciar Sesion</h1>
        </div>
        <p className="text-xs text-[#D6EAF8]">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
      </header>

      {/* Form */}
      <div className="px-5 py-6">
        <form onSubmit={handleLogin} className="space-y-4">
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
                placeholder="Tu contrasena"
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
            disabled={loading || !email || !password}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              loading || !email || !password
                ? 'bg-[#E2E8F0] text-[#5D6D7E]'
                : 'bg-[#1A5276] text-white active:scale-95'
            }`}
          >
            {loading ? 'Iniciando sesion...' : 'Iniciar Sesion'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-[10px] text-[#5D6D7E]">
            No tienes cuenta? Contacta al administrador del taller.
          </p>
        </div>

        <div className="mt-4 p-4 bg-[#EBF5FB] rounded-xl">
          <p className="text-[10px] font-bold text-[#1A5276] mb-2">Credenciales de prueba:</p>
          <p className="text-[10px] text-[#5D6D7E]">
            <strong>Mecanico:</strong> test@test.com / mobile_test@test.com_m3motors
          </p>
          <p className="text-[10px] text-[#5D6D7E]">
            <strong>Cliente:</strong> mateopaulna2@gmail.com / mobile_mateopaulna2@gmail.com_m3motors
          </p>
        </div>
      </div>
    </div>
  )
}
