import { Link } from 'react-router-dom'
import { SignedOut } from '@clerk/clerk-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">M3Motors</h1>
          <SignedOut>
            <div className="space-x-4">
              <Link to="/login" className="hover:underline">Iniciar Sesión</Link>
              <Link to="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-gray-100">
                Registrarse
              </Link>
            </div>
          </SignedOut>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          Gestión Inteligente para Talleres Mecánicos
        </h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Mantenimiento predictivo, historial vehicular y comunicación directa con tus clientes.
          Todo en una sola plataforma.
        </p>
        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700"
        >
          Comenzar Gratis
        </Link>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4"> Historial Completo</h3>
            <p className="text-gray-600">Registro detallado de cada intervención con fotos, diagnósticos y componentes.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">Alertas Predictivas</h3>
            <p className="text-gray-600">Notificaciones automáticas cuando se acerca el momento de mantenimiento.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow">
            <h3 className="text-xl font-bold mb-4">QR por Vehículo</h3>
            <p className="text-gray-600">Código único para acceso instantáneo al historial desde cualquier dispositivo.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
