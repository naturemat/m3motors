import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  Home,
  History,
  QrCode,
  User,
  Car,
  AlertTriangle,
  LogOut,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  placa: string
  ultimoKilometraje: number
  qr?: { codigo: string }
  alertas?: any[]
}

export default function MobileClientDashboard() {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      const vehiculosRes = await axios.get(`${apiUrl}/client/dashboard/vehiculos`, { headers })
      setVehiculos(vehiculosRes.data.vehiculos ?? [])
    } catch (err) {
      console.error('[MobileClientDashboard] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleLogout = () => {
    localStorage.removeItem('mobile_user')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <div className="text-center">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-10 h-10 mx-auto mb-3 animate-pulse" />
          <p className="text-[#5D6D7E] text-xs">Cargando...</p>
        </div>
      </div>
    )
  }

  const vehicle = vehiculos[0]

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1A5276] to-[#154360] text-white px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#D6EAF8] text-xs font-medium">Bienvenido,</p>
            <h1 className="text-lg font-bold">
              {mobileUser.name ?? 'Cliente'}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Vehicle Card */}
      <div className="px-5 -mt-3">
        {vehicle ? (
          <div className="bg-white rounded-xl shadow-md p-5 border border-[#E2E8F0]/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-[#1A5276]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#2C3E50]">
                  {vehicle.marca} {vehicle.modelo}
                </h2>
                <p className="text-[10px] text-[#5D6D7E] font-mono uppercase">
                  {vehicle.placa}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F4F6F7] rounded-lg p-3">
                <p className="text-[9px] text-[#5D6D7E] font-bold uppercase tracking-wider">
                  Kilometraje
                </p>
                <p className="text-sm font-bold text-[#2C3E50]">
                  {vehicle.ultimoKilometraje.toLocaleString()} km
                </p>
              </div>
              <div className="bg-[#F4F6F7] rounded-lg p-3">
                <p className="text-[9px] text-[#5D6D7E] font-bold uppercase tracking-wider">
                  Alertas
                </p>
                <p className="text-sm font-bold text-[#2C3E50]">
                  {vehicle.alertas?.length ?? 0}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-[#E2E8F0]/60">
            <Car className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">
              No tienes vehiculos registrados aun.
            </p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <section className="px-5 mt-5">
        <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
          Acciones Rapidas
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <Link
            to="/mobile/client/history"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-[#E2E8F0]/60 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-[#1A5276]" />
            </div>
            <span className="text-[10px] font-bold text-[#2C3E50]">Historial</span>
          </Link>

          <Link
            to="/mobile/client/qr"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-[#E2E8F0]/60 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-[#D5F5E3] rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-[#27AE60]" />
            </div>
            <span className="text-[10px] font-bold text-[#2C3E50]">Mi QR</span>
          </Link>

          <Link
            to="/mobile/client/profile"
            className="bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-[#E2E8F0]/60 active:scale-95 transition-transform"
          >
            <div className="w-10 h-10 bg-[#FEF9E7] rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-[#F39C12]" />
            </div>
            <span className="text-[10px] font-bold text-[#2C3E50]">Perfil</span>
          </Link>
        </div>
      </section>

      {/* Alerts */}
      {vehicle?.alertas && vehicle.alertas.length > 0 && (
        <section className="px-5 mt-5">
          <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
            Alertas Activas
          </h3>
          <div className="space-y-2">
            {vehicle.alertas.slice(0, 3).map((alerta: any, i: number) => (
              <div
                key={i}
                className="bg-[#FEF9E7] border border-[#F39C12]/20 rounded-xl p-4 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-[#F39C12] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#2C3E50]">
                    {alerta.componenteAfectado}
                  </p>
                  <p className="text-[10px] text-[#5D6D7E] mt-1">
                    {alerta.mensajePrediccion}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/client" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <Home className="w-5 h-5 fill-current" />
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/client/history" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <History className="w-5 h-5" />
          <span className="text-[9px] font-bold">Historial</span>
        </Link>
        <Link to="/mobile/client/qr" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <QrCode className="w-5 h-5" />
          <span className="text-[9px] font-bold">QR</span>
        </Link>
        <Link to="/mobile/client/profile" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
