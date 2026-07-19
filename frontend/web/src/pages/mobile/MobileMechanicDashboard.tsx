import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import {
  LayoutDashboard,
  Users,
  Wrench,
  LogOut,
  Car,
  QrCode,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface KPIs {
  totalIntervenciones: number
  intervencionesMes: number
  vehiculosAtendidos: number
  clientesAtendidos: number
}

interface ClientePendiente {
  id: number
  nombre: string
  email: string
  telefono: string
  licensePlate: string | null
}

interface VehiculoAsignado {
  placa: string
  marca: string
  modelo: string
  anio: number
  kilometraje: number
  status: string
}

// Mock data: Cliente Test siempre visible
const MOCK_CLIENTE = {
  id: 14,
  nombre: 'Cliente Test',
  email: 'cliente@m3motors.com',
  telefono: '+593998888888',
  vehiculos: [
    { placa: 'PCM-0123', marca: 'Honda', modelo: 'CR-V', anio: 2022, kilometraje: 25000, status: 'ACTIVATED' },
    { placa: 'CLT-001', marca: 'Chevrolet', modelo: 'Spark', anio: 2021, kilometraje: 32000, status: 'ACTIVE' },
    { placa: 'CLT-002', marca: 'Nissan', modelo: 'Versa', anio: 2023, kilometraje: 11000, status: 'ACTIVE' },
  ] as VehiculoAsignado[],
}

export default function MobileMechanicDashboard() {
  const navigate = useNavigate()
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [clientesPendientes, setClientesPendientes] = useState<ClientePendiente[]>([])
  const [loading, setLoading] = useState(true)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${mobileUser.token}` }

        const [kpisRes, clientesRes] = await Promise.all([
          axios.get(`${apiUrl}/mechanic/dashboard/kpis`, { headers }),
          axios.get(`${apiUrl}/mechanic/dashboard/clientes-pendientes`, { headers }),
        ])

        if (kpisRes.data) setKpis(kpisRes.data)
        setClientesPendientes(clientesRes.data.clientes ?? [])
      } catch (err) {
        console.error('[MobileMechanicDashboard] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])

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

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1A5276] to-[#154360] text-white px-5 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[#D6EAF8] text-xs font-medium">Mecanico,</p>
            <h1 className="text-lg font-bold">
              {mobileUser.name ?? 'Tecnico'}
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

      {/* KPIs */}
      <div className="px-5 -mt-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]/60">
            <div className="flex items-center gap-2 mb-2">
              <Car className="w-4 h-4 text-[#27AE60]" />
              <span className="text-[9px] text-[#5D6D7E] font-bold uppercase">Vehiculos</span>
            </div>
            <p className="text-xl font-bold text-[#2C3E50]">{kpis?.vehiculosAtendidos ?? 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]/60">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#2E86C1]" />
              <span className="text-[9px] text-[#5D6D7E] font-bold uppercase">Clientes</span>
            </div>
            <p className="text-xl font-bold text-[#2C3E50]">{kpis?.clientesAtendidos ?? 0}</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-[#E2E8F0]/60">
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-[#F39C12]" />
              <span className="text-[9px] text-[#5D6D7E] font-bold uppercase">Este Mes</span>
            </div>
            <p className="text-xl font-bold text-[#2C3E50]">{kpis?.intervencionesMes ?? 0}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="px-5 mt-5">
        <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
          Acciones Rapidas
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <Link
            to="/mobile/mechanic/scanner"
            className="bg-[#1A5276] text-white rounded-xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <QrCode className="w-6 h-6" />
            <div>
              <p className="text-xs font-bold">Escanear QR</p>
              <p className="text-[10px] text-white/70">Buscar vehiculo</p>
            </div>
          </Link>

          <Link
            to="/mobile/mechanic/register-vehicle"
            className="bg-[#27AE60] text-white rounded-xl p-4 flex items-center gap-3 active:scale-95 transition-transform"
          >
            <Car className="w-6 h-6" />
            <div>
              <p className="text-xs font-bold">Registrar Auto</p>
              <p className="text-[10px] text-white/70">Foto + OCR</p>
            </div>
          </Link>

          <Link
            to="/mobile/mechanic/customers"
            className="bg-white rounded-xl p-4 flex items-center gap-3 border border-[#E2E8F0]/60 active:scale-95 transition-transform"
          >
            <Users className="w-6 h-6 text-[#1A5276]" />
            <div>
              <p className="text-xs font-bold text-[#2C3E50]">Clientes</p>
              <p className="text-[10px] text-[#5D6D7E]">Ver listado</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Pending Clients */}
      {clientesPendientes.length > 0 && (
        <section className="px-5 mt-5">
          <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
            Clientes Pendientes
          </h3>
          <div className="space-y-2">
            {clientesPendientes.slice(0, 5).map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 flex items-center gap-3"
              >
                <div className="w-9 h-9 bg-[#FEF9E7] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#F39C12]">
                    {cliente.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#2C3E50] truncate">{cliente.nombre}</p>
                  <p className="text-[10px] text-[#5D6D7E]">
                    {cliente.licensePlate ?? 'Sin placa'}
                  </p>
                </div>
                <span className="text-[9px] font-bold text-[#F39C12] bg-[#FEF9E7] px-2 py-0.5 rounded-full">
                  Pendiente
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Clientes Asignados (mock data) */}
      <section className="px-5 mt-5">
        <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
          Clientes Asignados
        </h3>
        <div className="bg-white rounded-xl border border-[#E2E8F0]/60 overflow-hidden">
          {/* Cliente header */}
          <div className="p-4 border-b border-[#E2E8F0]/60 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1A5276] rounded-full flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">CT</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#2C3E50]">{MOCK_CLIENTE.nombre}</p>
              <p className="text-[10px] text-[#5D6D7E]">{MOCK_CLIENTE.email}</p>
              <p className="text-[10px] text-[#5D6D7E]">{MOCK_CLIENTE.telefono}</p>
            </div>
            <span className="text-[9px] font-bold text-[#27AE60] bg-[#EAFAF1] px-2 py-0.5 rounded-full">
              Activo
            </span>
          </div>
          {/* Vehículos */}
          <div className="divide-y divide-[#E2E8F0]/60">
            {MOCK_CLIENTE.vehiculos.map((v) => (
              <div key={v.placa} className="px-4 py-3 flex items-center gap-3">
                <Car className="w-4 h-4 text-[#1A5276] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-[#2C3E50]">
                    {v.marca} {v.modelo} ({v.anio})
                  </p>
                  <p className="text-[10px] text-[#5D6D7E]">
                    Placa: {v.placa} — {v.kilometraje.toLocaleString()} km
                  </p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  v.status === 'ACTIVATED' ? 'text-[#27AE60] bg-[#EAFAF1]' : 'text-[#2E86C1] bg-[#EBF5FB]'
                }`}>
                  {v.status === 'ACTIVATED' ? 'Activo' : 'Activo'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/mechanic/scanner" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <QrCode className="w-5 h-5" />
          <span className="text-[9px] font-bold">Escanear</span>
        </Link>
        <Link to="/mobile/mechanic/register-vehicle" className="flex flex-col items-center gap-1 text-[#27AE60]">
          <Car className="w-5 h-5 fill-current" />
          <span className="text-[9px] font-bold">Vehiculo</span>
        </Link>
        <Link to="/mobile/mechanic/manual-intervention" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <Wrench className="w-5 h-5 fill-current" />
          <span className="text-[9px] font-bold">Revision</span>
        </Link>
        <Link to="/mobile/mechanic/customers" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <Users className="w-5 h-5" />
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
      </nav>
    </div>
  )
}
