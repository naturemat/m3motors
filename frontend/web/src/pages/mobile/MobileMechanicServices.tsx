import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Wrench, Car, DollarSign } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Service {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string
  precioReferencia: string | null
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  'Mantenimiento': { bg: 'bg-[#EBF5FB]', text: 'text-[#1A5276]' },
  'Frenos': { bg: 'bg-[#FDEDEC]', text: 'text-[#E74C3C]' },
  'Suspensión': { bg: 'bg-[#FEF9E7]', text: 'text-[#F39C12]' },
  'Motor': { bg: 'bg-[#D5F5E3]', text: 'text-[#27AE60]' },
  'General': { bg: 'bg-[#F4F6F7]', text: 'text-[#5D6D7E]' },
}

export default function MobileMechanicServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      const res = await axios.get(`${apiUrl}/mechanic/dashboard/services`, { headers })
      setServices(res.data.services ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al cargar servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <p className="text-[#5D6D7E] text-xs">Cargando servicios...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Catalogo de Servicios</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {error && (
          <div className="bg-[#FDEDEC] rounded-xl p-3">
            <p className="text-xs text-[#E74C3C]">{error}</p>
          </div>
        )}

        {services.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">No hay servicios registrados en el catalogo.</p>
          </div>
        ) : (
          services.map((service) => {
            const colors = categoryColors[service.categoria] ?? categoryColors['General']
            return (
              <div key={service.id} className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center shrink-0`}>
                    <Wrench className={`w-5 h-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#2C3E50]">{service.nombre}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                      {service.categoria}
                    </span>
                    {service.descripcion && (
                      <p className="text-[10px] text-[#5D6D7E] mt-1">{service.descripcion}</p>
                    )}
                  </div>
                  {service.precioReferencia && (
                    <div className="text-right shrink-0">
                      <DollarSign className="w-3 h-3 text-[#27AE60] inline" />
                      <span className="text-sm font-bold text-[#27AE60]">{service.precioReferencia}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })
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
        <Link to="/mobile/mechanic/customers" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
        <Link to="/mobile/mechanic/services" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Servicios</span>
        </Link>
      </nav>
    </div>
  )
}
