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
  Bell,
  Wrench,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Gauge,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Vehiculo {
  id: number
  marca: string
  modelo: string
  placa: string
  ultimoKilometraje: number
  qr?: { codigo: string }
  alertas?: {
    componenteAfectado: string
    mensajePrediccion: string
    severidad: string
    kilometrajeActual: number
    kilometrajeLimite: number
    semanasEstimadas: number
  }[]
}

const severidadColors: Record<string, { bg: string; text: string; border: string }> = {
  CRITICA: { bg: 'bg-[#FDEDEC]', text: 'text-[#E74C3C]', border: 'border-[#E74C3C]/20' },
  MEDIA: { bg: 'bg-[#FEF9E7]', text: 'text-[#F39C12]', border: 'border-[#F39C12]/20' },
  BAJA: { bg: 'bg-[#D5F5E3]', text: 'text-[#27AE60]', border: 'border-[#27AE60]/20' },
}

export default function MobileClientDashboard() {
  const navigate = useNavigate()
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
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

  const vehicle = vehiculos[selectedIndex]
  const totalAlertas = vehiculos.reduce((sum, v) => sum + (v.alertas?.length ?? 0), 0)

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
          <div className="flex items-center gap-2">
            <Link to="/mobile/client/notifications" className="relative w-9 h-9 bg-white/10 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4" />
              {totalAlertas > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E74C3C] rounded-full text-[8px] font-bold flex items-center justify-center">
                  {totalAlertas}
                </span>
              )}
            </Link>
            <button
              onClick={handleLogout}
              className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {vehiculos.length === 0 ? (
        /* Sin vehiculos */
        <div className="px-5 -mt-3">
          <div className="bg-white rounded-xl shadow-md p-6 text-center border border-[#E2E8F0]/60">
            <Car className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">
              No tienes vehiculos registrados aun.
            </p>
            <p className="text-[10px] text-[#5D6D7E] mt-1">
              Contacta a tu taller para registrar tu vehiculo.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Vehicle Selector - carousel horizontal */}
          {vehiculos.length > 1 && (
            <div className="px-5 -mt-3 mb-3">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 snap-x snap-mandatory">
                {vehiculos.map((v, i) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedIndex(i)}
                    className={`shrink-0 snap-start rounded-xl p-3 border transition-all min-w-[140px] ${
                      i === selectedIndex
                        ? 'bg-[#1A5276] text-white border-[#1A5276] shadow-md'
                        : 'bg-white text-[#2C3E50] border-[#E2E8F0]/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="w-4 h-4" />
                      <span className="text-[10px] font-bold truncate">{v.marca} {v.modelo}</span>
                    </div>
                    <p className={`text-[9px] font-mono ${i === selectedIndex ? 'text-[#D6EAF8]' : 'text-[#5D6D7E]'}`}>
                      {v.placa}
                    </p>
                  </button>
                ))}
              </div>
              {/* Dots */}
              <div className="flex justify-center gap-1.5 mt-2">
                {vehiculos.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === selectedIndex ? 'bg-[#1A5276]' : 'bg-[#D5DDE5]'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Vehicle Info Card */}
          {vehicle && (
            <div className="px-5">
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
            </div>
          )}

          {/* Maintenance Predictions Cards */}
          {vehicle?.alertas && vehicle.alertas.length > 0 && (
            <section className="px-5 mt-4">
              <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
                Mantenimiento Preventivo
              </h3>
              <div className="space-y-2">
                {vehicle.alertas.map((alerta, i) => {
                  const colors = severidadColors[alerta.severidad] ?? severidadColors.BAJA
                  const porcentaje = alerta.kilometrajeLimite > 0
                    ? Math.min(100, Math.round((alerta.kilometrajeActual / alerta.kilometrajeLimite) * 100))
                    : 0
                  return (
                    <div
                      key={i}
                      className={`rounded-xl p-4 border ${colors.border} ${colors.bg}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0">
                          <Wrench className={`w-4 h-4 ${colors.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-[#2C3E50]">
                              {alerta.componenteAfectado}
                            </p>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}>
                              {alerta.severidad}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#5D6D7E] leading-relaxed">
                            {alerta.mensajePrediccion}
                          </p>
                          {/* Progress bar */}
                          <div className="mt-2">
                            <div className="flex justify-between text-[9px] text-[#5D6D7E] mb-1">
                              <span>{alerta.kilometrajeActual.toLocaleString()} km</span>
                              <span>{alerta.kilometrajeLimite.toLocaleString()} km</span>
                            </div>
                            <div className="w-full bg-white/60 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${colors.text === 'text-[#E74C3C]' ? 'bg-[#E74C3C]' : colors.text === 'text-[#F39C12]' ? 'bg-[#F39C12]' : 'bg-[#27AE60]'}`}
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                          <p className="text-[9px] text-[#5D6D7E] mt-1">
                            {alerta.semanasEstimadas > 0
                              ? `~${alerta.semanasEstimadas} semana${alerta.semanasEstimadas !== 1 ? 's' : ''} restante${alerta.semanasEstimadas !== 1 ? 's' : ''}`
                              : 'Requiere atencion inmediata'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Sin alertas */}
          {vehicle && (!vehicle.alertas || vehicle.alertas.length === 0) && (
            <section className="px-5 mt-4">
              <div className="bg-[#D5F5E3] rounded-xl p-4 border border-[#27AE60]/20 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#27AE60] shrink-0" />
                <div>
                  <p className="text-xs font-bold text-[#2C3E50]">
                    Tu vehiculo esta en optimas condiciones
                  </p>
                  <p className="text-[10px] text-[#5D6D7E]">
                    No se detectaron mantenimientos pendientes.
                  </p>
                </div>
              </div>
            </section>
          )}

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
        </>
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
        <Link to="/mobile/client/notifications" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <Bell className="w-5 h-5" />
          <span className="text-[9px] font-bold">Alertas</span>
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
