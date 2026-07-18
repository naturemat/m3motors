import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Mail, Phone, LogOut } from 'lucide-react'

export default function MobileClientProfile() {
  const navigate = useNavigate()
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const handleLogout = () => {
    localStorage.removeItem('mobile_user')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/client" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Mi Perfil</h1>
      </header>

      {/* Profile Card */}
      <div className="px-5 py-6">
        <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E2E8F0]/60 text-center mb-6">
          <div className="w-16 h-16 bg-[#EBF5FB] rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-[#1A5276]" />
          </div>
          <h2 className="text-base font-bold text-[#2C3E50]">
            {mobileUser.name ?? 'Cliente'}
          </h2>
          <p className="text-xs text-[#5D6D7E] mt-1">Cliente</p>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]/60 space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#1A5276]" />
            </div>
            <div>
              <p className="text-[9px] text-[#5D6D7E] font-bold uppercase tracking-wider">Email</p>
              <p className="text-xs text-[#2C3E50]">
                {mobileUser.email ?? 'No disponible'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D5F5E3] rounded-lg flex items-center justify-center">
              <Phone className="w-4 h-4 text-[#27AE60]" />
            </div>
            <div>
              <p className="text-[9px] text-[#5D6D7E] font-bold uppercase tracking-wider">Telefono</p>
              <p className="text-xs text-[#2C3E50]">
                {mobileUser.phone ?? 'No registrado'}
              </p>
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full bg-[#FDEDEC] text-[#E74C3C] py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesion
        </button>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/client" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/client/history" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Historial</span>
        </Link>
        <Link to="/mobile/client/qr" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">QR</span>
        </Link>
        <Link to="/mobile/client/profile" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
