import { Link, Navigate } from 'react-router-dom'
import { SignedOut, SignedIn } from '@clerk/clerk-react'
import { Shield, Bell, QrCode, ArrowRight, Download, Smartphone } from 'lucide-react'

export default function Landing() {
  return (
    <>
      <SignedIn>
        <Navigate to="/dashboard" replace />
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-white">
          {/* Header */}
          <header className="bg-[#1A5276] text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <img src="/Logo_M3Motors.png" alt="M3Motors" className="h-10" />
              <div className="space-x-4">
                <Link to="/login" className="text-white hover:text-[#D6EAF8] transition-colors font-medium">
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-[#1A5276] px-4 py-2 rounded-lg font-medium hover:bg-[#EBF5FB] transition-colors"
                >
                  Registrarse
                </Link>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <section
            className="text-white py-20 sm:py-28"
            style={{ background: 'linear-gradient(135deg, #1A5276 0%, #2E86C1 100%)' }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Gestión Inteligente para Talleres Mecánicos
              </h1>
              <p className="text-lg sm:text-xl text-[#D6EAF8] mb-10 max-w-2xl mx-auto">
                Mantenimiento predictivo, historial vehicular y comunicación directa con tus clientes.
                Todo en una sola plataforma.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 bg-white text-[#1A5276] px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#EBF5FB] transition-colors shadow-lg"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href={`${window.location.origin}/apk/M3Motors.apk`}
                  download
                  className="inline-flex items-center gap-2 border-2 border-white/50 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Descargar APK
                </a>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-20 bg-[#F4F6F7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#2C3E50] mb-12">
                Todo lo que tu taller necesita
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#EBF5FB] rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-[#1A5276]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">
                    Historial Completo
                  </h3>
                  <p className="text-[#5D6D7E] leading-relaxed">
                    Registro detallado de cada intervención con fotos, diagnósticos y componentes.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#EBF5FB] rounded-lg flex items-center justify-center mb-4">
                    <Bell className="w-6 h-6 text-[#1A5276]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">
                    Alertas Predictivas
                  </h3>
                  <p className="text-[#5D6D7E] leading-relaxed">
                    Notificaciones automáticas cuando se acerca el momento de mantenimiento.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-[#EBF5FB] rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="w-6 h-6 text-[#1A5276]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#2C3E50] mb-3">
                    QR por Vehículo
                  </h3>
                  <p className="text-[#5D6D7E] leading-relaxed">
                    Código único para acceso instantáneo al historial desde cualquier dispositivo.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#2C3E50] mb-4">
                ¿Listo para modernizar tu taller?
              </h2>
              <p className="text-lg text-[#5D6D7E] mb-8 max-w-xl mx-auto">
                Únete a los talleres que ya confían en M3Motors para gestionar sus operaciones.
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-[#1A5276] text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-[#154360] transition-colors shadow-md"
              >
                Empezar Ahora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-[#2C3E50] text-white py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <img src="/Logo_M3Motors.png" alt="M3Motors" className="h-10 brightness-0 invert" />
                  <p className="text-[#95A5A6] mt-2 text-sm">
                    Gestión inteligente para talleres mecánicos
                  </p>
                </div>
                <div className="flex space-x-6 text-sm text-[#95A5A6]">
                  <span>© 2026 M3Motors</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </SignedOut>
    </>
  )
}
