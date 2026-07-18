import { Navigate, useNavigate } from 'react-router-dom'
import {
  Wrench,
  Droplets,
  Shield,
  Activity,
  Settings,
  Zap,
  ChevronRight,
  Phone,
  MapPin,
  Clock,
} from 'lucide-react'

const services = [
  {
    icon: Wrench,
    title: 'Balanceo de Automaticas',
    description: 'Alineacion y balanceo completo para tu transmision automatica.',
    color: 'bg-[#EBF5FB]',
    iconColor: 'text-[#1A5276]',
  },
  {
    icon: Droplets,
    title: 'Cambio de Aceite',
    description: 'Aceite sintetico y filtros de las mejores marcas.',
    color: 'bg-[#D5F5E3]',
    iconColor: 'text-[#27AE60]',
  },
  {
    icon: Shield,
    title: 'Frenos y Suspension',
    description: 'Revision de discos, pastillas, amortiguadores y ABS.',
    color: 'bg-[#FDEDEC]',
    iconColor: 'text-[#E74C3C]',
  },
  {
    icon: Activity,
    title: 'Diagnostico Electronico',
    description: 'Escaneo OBD2 completo con tecnologia de vanguardia.',
    color: 'bg-[#FEF9E7]',
    iconColor: 'text-[#F39C12]',
  },
  {
    icon: Settings,
    title: 'Alineacion y Balanceo',
    description: 'Alineacion 3D y balanceo de llantas con laser.',
    color: 'bg-[#EBF5FB]',
    iconColor: 'text-[#2E86C1]',
  },
  {
    icon: Zap,
    title: 'Servicio General Express',
    description: 'Mantenimiento rapido y profesional para tu vehiculo.',
    color: 'bg-[#F4F6F7]',
    iconColor: 'text-[#1A5276]',
  },
]

export default function MobileLanding() {
  const navigate = useNavigate()
  const mobileUser = localStorage.getItem('mobile_user')

  if (mobileUser) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7]">
      {/* Hero */}
      <header className="bg-gradient-to-br from-[#1A5276] to-[#154360] text-white px-6 pt-12 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <img
            src="/Logo_M3Motors.png"
            alt="M3Motors"
            className="h-14 mx-auto mb-5"
          />
          <h1 className="text-2xl font-bold mb-3 leading-tight">
            Tu carro seguro con nosotros
          </h1>
          <p className="text-[#D6EAF8] text-sm leading-relaxed mb-8">
            Mantenimiento predictivo, historial vehicular y servicios
            profesionales. Todo en una sola plataforma.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white text-[#1A5276] px-8 py-3.5 rounded-xl text-sm font-bold active:scale-95 transition-transform shadow-lg"
          >
            Iniciar Sesion
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Services */}
      <section className="px-5 py-8 -mt-4">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-bold text-[#2C3E50] mb-1">
            Nuestros Servicios
          </h2>
          <p className="text-xs text-[#5D6D7E] mb-5">
            Soluciones integrales para mantener tu vehiculo en optimas
            condiciones.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {services.map((s) => (
              <div
                key={s.title}
                className={`${s.color} p-4 rounded-xl border border-white/60`}
              >
                <div
                  className={`w-10 h-10 ${s.color} rounded-lg flex items-center justify-center mb-3`}
                >
                  <s.icon className={`w-5 h-5 ${s.iconColor}`} />
                </div>
                <h3 className="text-xs font-bold text-[#2C3E50] mb-1 leading-tight">
                  {s.title}
                </h3>
                <p className="text-[10px] text-[#5D6D7E] leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 py-6">
        <div className="max-w-lg mx-auto bg-[#1A5276] text-white rounded-2xl p-6 text-center">
          <h3 className="text-base font-bold mb-2">
            ¿Listo para cuidar tu vehiculo?
          </h3>
          <p className="text-xs text-[#D6EAF8] mb-5">
            Unete a los talleres que ya confian en M3Motors.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 bg-white text-[#1A5276] px-6 py-3 rounded-xl text-sm font-bold active:scale-95 transition-transform"
          >
            Comenzar Ahora
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2C3E50] text-white px-6 py-8 mt-4">
        <div className="max-w-lg mx-auto space-y-4">
          <div className="flex items-center gap-2">
            <img
              src="/Logo_M3Motors.png"
              alt="M3Motors"
              className="h-8 brightness-0 invert"
            />
            <span className="font-bold text-sm">M3Motors</span>
          </div>
          <div className="space-y-2 text-xs text-[#95A5A6]">
            <p className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#2E86C1]" />
              Calle Industrial #456, Ciudad Mecanica
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-[#2E86C1]" />
              (555) 123-4567
            </p>
            <p className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#2E86C1]" />
              Lun - Vie: 8:00 - 18:00
            </p>
          </div>
          <div className="pt-3 border-t border-white/10 text-center text-[10px] text-[#95A5A6]">
            © 2026 M3Motors. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  )
}
