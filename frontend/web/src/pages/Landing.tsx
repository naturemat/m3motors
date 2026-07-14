import { Link, Navigate } from 'react-router-dom'
import { SignedOut, SignedIn } from '@clerk/clerk-react'

export default function Landing() {
  return (
    <>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-white">
          <header className="bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
              <img src="/logo.svg" alt="M3Motors" className="h-8" />
              <div className="space-x-4">
                <Link to="/login" className="hover:underline">Iniciar Sesión</Link>
                <Link to="/register" className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-neutral-100">
                  Registrarse
                </Link>
              </div>
            </div>
          </header>

          <section className="max-w-7xl mx-auto px-4 py-20 text-center">
            <h2 className="text-5xl font-bold text-neutral-900 mb-6">
              Gestión Inteligente para Talleres Mecánicos
            </h2>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Mantenimiento predictivo, historial vehicular y comunicación directa con tus clientes.
              Todo en una sola plataforma.
            </p>
            <Link
              to="/register"
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-600"
            >
              Comenzar Gratis
            </Link>
          </section>

          <section className="bg-neutral-100 py-20">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Historial Completo</h3>
                <p className="text-neutral-600">Registro detallado de cada intervención con fotos, diagnósticos y componentes.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">Alertas Predictivas</h3>
                <p className="text-neutral-600">Notificaciones automáticas cuando se acerca el momento de mantenimiento.</p>
              </div>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                <h3 className="text-xl font-bold mb-4">QR por Vehículo</h3>
                <p className="text-neutral-600">Código único para acceso instantáneo al historial desde cualquier dispositivo.</p>
              </div>
            </div>
          </section>
        </div>
      </SignedOut>
    </>
  )
}
