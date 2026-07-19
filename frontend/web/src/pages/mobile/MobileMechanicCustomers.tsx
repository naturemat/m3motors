import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Users, Car, Phone, Mail } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Cliente {
  id: number
  nombre: string
  email: string
  telefono: string
  status: string
  vehiculos?: { placa: string; marca: string; modelo: string }[]
}

// Mock data: Cliente Test siempre visible
const MOCK_CLIENTES: Cliente[] = [
  {
    id: 14,
    nombre: 'Cliente Test',
    email: 'cliente@m3motors.com',
    telefono: '+593998888888',
    status: 'ACTIVATED',
    vehiculos: [
      { placa: 'PCM-0123', marca: 'Honda', modelo: 'CR-V' },
      { placa: 'CLT-001', marca: 'Chevrolet', modelo: 'Spark' },
      { placa: 'CLT-002', marca: 'Nissan', modelo: 'Versa' },
    ],
  },
]

export default function MobileMechanicCustomers() {
  const [clientes, setClientes] = useState<Cliente[]>(MOCK_CLIENTES)
  const [loading, setLoading] = useState(true)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  useEffect(() => {
    async function fetchData() {
      try {
        const headers = { Authorization: `Bearer ${mobileUser.token}` }
        const res = await axios.get(`${apiUrl}/mechanic/dashboard/clientes-pendientes`, { headers })
        const apiClientes = res.data.clientes ?? []
        // Merge mock + API data, avoiding duplicates
        const existingIds = new Set(apiClientes.map((c: Cliente) => c.id))
        const merged = [...apiClientes, ...MOCK_CLIENTES.filter(m => !existingIds.has(m.id))]
        setClientes(merged)
      } catch (err) {
        console.error('[MobileMechanicCustomers] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    void fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <p className="text-[#5D6D7E] text-xs">Cargando clientes...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Clientes</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {clientes.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">No hay clientes registrados.</p>
          </div>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-[#EBF5FB] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#1A5276]">
                    {cliente.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#2C3E50] truncate">{cliente.nombre}</p>
                  <p className="text-[10px] text-[#5D6D7E]">{cliente.email}</p>
                </div>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  cliente.status === 'ACTIVATED' ? 'bg-[#D5F5E3] text-[#27AE60]' : 'bg-[#FEF9E7] text-[#F39C12]'
                }`}>
                  {cliente.status === 'ACTIVATED' ? 'Activo' : 'Pendiente'}
                </span>
              </div>
              {cliente.vehiculos && cliente.vehiculos.length > 0 && (
                <div className="mt-2 flex items-center gap-2 text-[10px] text-[#5D6D7E]">
                  <Car className="w-3 h-3" />
                  {cliente.vehiculos.map(v => `${v.marca} ${v.modelo} (${v.placa})`).join(', ')}
                </div>
              )}
              <div className="mt-2 flex gap-3 text-[10px] text-[#5D6D7E]">
                <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{cliente.telefono}</span>
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{cliente.email}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/mechanic/scanner" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Escanear</span>
        </Link>
        <Link to="/mobile/mechanic/register-vehicle" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <Car className="w-5 h-5" />
          <span className="text-[9px] font-bold">Vehiculo</span>
        </Link>
        <Link to="/mobile/mechanic/manual-intervention" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Revision</span>
        </Link>
        <Link to="/mobile/mechanic/customers" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
        <Link to="/mobile/mechanic/services" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Servicios</span>
        </Link>
      </nav>
    </div>
  )
}
