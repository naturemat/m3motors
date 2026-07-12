import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import ReCAPTCHA from 'react-google-recaptcha'
import axios from 'axios'
import { useParams, Link } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
const recaptchaKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY ?? ''

type FormValues = {
  nombre: string
  telefono: string
  email: string
  placa?: string
}

export default function PublicLanding() {
  const { id } = useParams()
  const [workshop, setWorkshop] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<FormValues>({ mode: 'onChange' })

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const res = await axios.get(`${apiUrl}/public/workshop/${id}`)
        setWorkshop(res.data.workshop)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [id])

  const onSubmit = async (data: FormValues) => {
    setServerError(null)
    if (!captchaToken) {
      setServerError('Por favor completa el captcha')
      return
    }

    try {
      await axios.post(`${apiUrl}/public/workshop/${id}/pre-register`, { ...data }, { headers: { 'x-recaptcha-token': captchaToken } })
      setSuccess(true)
      reset()
    } catch (err: any) {
      console.error(err)
      setServerError(err?.response?.data?.message ?? 'Error al pre-registrar')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">Cargando información del taller...</p>
        </div>
      </div>
    )
  }

  if (!workshop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-error-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">!</span>
          </div>
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Taller no encontrado</h2>
          <p className="text-neutral-600">El enlace puede estar incorrecto o el taller ya no está disponible.</p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-neutralBg p-6" style={{ backgroundColor: 'var(--color-neutral-bg)' }}>
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-slate-900">¡Pre-registro exitoso!</h2>
          <p className="mt-4 text-slate-700">Tu registro está pendiente de activación por el taller. Recibirás un email cuando tu cuenta esté activa.</p>
          <div className="mt-6">
            <Link to="/" className="rounded-3xl bg-primary px-4 py-2 text-white">Volver al inicio</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutralBg p-6" style={{ backgroundColor: 'var(--color-neutral-bg)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <aside className="bg-white p-6 rounded-2xl shadow">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-slate-100 rounded-lg flex items-center justify-center">{workshop?.nombre?.charAt(0)}</div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{workshop?.nombre}</h1>
              <p className="text-sm text-slate-600">{workshop?.direccion}</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <p><strong>Teléfono:</strong> {workshop?.telefono ?? '—'}</p>
            <p><strong>Horarios:</strong> {workshop?.horarios ?? '—'}</p>
            <p><strong>Email:</strong> {workshop?.email ?? '—'}</p>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-900">Servicios</h3>
            <ul className="mt-2 space-y-2 text-slate-700">
              {workshop?.servicios?.map((s: any) => (
                <li key={s.id}>• {s.nombre} — ${s.precioReferencia ?? '—'}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-slate-900">Ubicación</h3>
            <div className="mt-2">
              <iframe
                title="map"
                width="100%"
                height="200"
                loading="lazy"
                src={`https://www.google.com/maps?q=${encodeURIComponent(workshop?.direccion ?? '')}&output=embed`}
                className="rounded-md"
              />
            </div>
          </div>
        </aside>

        <main className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-2xl font-semibold text-slate-900">Pre-registro</h2>
          <p className="mt-2 text-sm text-slate-600">Completa tus datos y el taller revisará tu solicitud.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Nombre completo</label>
              <input {...register('nombre', { required: 'El nombre es obligatorio' })} className="w-full rounded px-3 py-2 border mt-1" />
              {errors.nombre && <p className="mt-1 text-rose-600 text-sm">{errors.nombre.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Teléfono</label>
              <input {...register('telefono', { required: 'Teléfono requerido', pattern: { value: /^\+593\d{8,9}$/, message: 'Formato inválido. Ej: +593987654321' } })} placeholder="+593987654321" className="w-full rounded px-3 py-2 border mt-1" />
              {errors.telefono && <p className="mt-1 text-rose-600 text-sm">{errors.telefono.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Email</label>
              <input {...register('email', { required: 'Email requerido', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email inválido' } })} className="w-full rounded px-3 py-2 border mt-1" />
              {errors.email && <p className="mt-1 text-rose-600 text-sm">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Placa del vehículo (opcional)</label>
              <input {...register('placa', { pattern: { value: /^[A-Z]{3}\d{4}$/i, message: 'Formato placa inválido. Ej: ABC1234' } })} placeholder="ABC1234" className="w-full rounded px-3 py-2 border mt-1" />
              {errors.placa && <p className="mt-1 text-rose-600 text-sm">{errors.placa.message}</p>}
            </div>

            <div className="mt-2">
              <ReCAPTCHA sitekey={recaptchaKey} onChange={token => setCaptchaToken(token)} />
            </div>

            {serverError && <div className="text-rose-600">{serverError}</div>}

            <div>
              <button type="submit" disabled={!isValid || !captchaToken} className="w-full rounded-3xl bg-primary px-4 py-3 text-white disabled:opacity-60">Pre-registrarme</button>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}
