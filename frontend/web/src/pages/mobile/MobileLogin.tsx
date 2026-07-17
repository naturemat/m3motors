import { useState } from 'react'
import { useSignIn } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function MobileLogin() {
  const navigate = useNavigate()
  const { signIn, setActive } = useSignIn()
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
      const result = await signIn.create({
        identifier: email,
        password,
      })

      console.log('[MobileLogin] Sign-in result status:', result.status)

      if (result.status === 'complete') {
        console.log('[MobileLogin] Login successful, activating session...')
        await setActive({ session: result.createdSessionId })
        navigate('/')
      } else if (result.status === 'needs_second_factor') {
        console.log('[MobileLogin] 2FA required')
        setError('Se requiere verificacion de dos factores. Contacta al administrador para desactivar 2FA.')
      } else if (result.status === 'needs_identifier') {
        setError('Email no registrado. Verifica tus credenciales.')
      } else if (result.status === 'needs_new_password') {
        setError('Debes cambiar tu contrasena. Contacta al administrador.')
      } else {
        console.log('[MobileLogin] Unexpected status:', result.status)
        setError(`Estado inesperado: ${result.status}`)
      }
    } catch (err: any) {
      console.error('[MobileLogin] Full error:', JSON.stringify(err, null, 2))
      const clerkError = err?.errors?.[0]
      if (clerkError) {
        console.error('[MobileLogin] Clerk error:', clerkError)
        setError(`Error Clerk: ${clerkError.message ?? clerkError.code ?? 'Unknown'}`)
      } else {
        setError(`Error: ${err?.message ?? err?.toString() ?? 'Desconocido'}`)
      }
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
      </div>
    </div>
  )
}
