import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Wrench, Calendar, Car } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Intervencion {
  id: number
  fecha: string
  diagnostico: string | null
  severidad: string | null
  manoDeObra: number | null
  estado: string
  tipoIntervencion: string
  vehiculo?: { placa: string; marca: string; modelo: string } | null
}

export default function MobileMechanicInterventions() {
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([])
  const [loading, setLoading] = useState(true)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      const res = await axios.get(`${apiUrl}/interventions`, { headers })
      setIntervenciones(res.data.interventions ?? [])
    } catch (err) {
      console.error('[MobileMechanicInterventions] Error:', err)
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
        <p className="text-[#5D6D7E] text-xs">Cargando intervenciones...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Servicios Realizados</h1>
      </header>

      <div className="px-5 py-4 space-y-3">
        {intervenciones.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">No hay intervenciones registradas.</p>
          </div>
        ) : (
          intervenciones.map((intervencion) => (
            <div key={intervencion.id} className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#1A5276]" />
                  <div>
                    <p className="text-xs font-bold text-[#2C3E50]">{intervencion.tipoIntervencion}</p>
                    {intervencion.vehiculo && (
                      <p className="text-[10px] text-[#5D6D7E]">
                        {intervencion.vehiculo.marca} {intervencion.vehiculo.modelo} ({intervencion.vehiculo.placa})
                      </p>
                    )}
                  </div>
                </div>
                {intervencion.severidad && (
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    intervencion.severidad === 'ALTA' || intervencion.severidad === 'CRITICA'
                      ? 'bg-[#FDEDEC] text-[#E74C3C]'
                      : intervencion.severidad === 'MEDIA'
                      ? 'bg-[#FEF9E7] text-[#F39C12]'
                      : 'bg-[#D5F5E3] text-[#27AE60]'
                  }`}>
                    {intervencion.severidad}
                  </span>
                )}
              </div>
              {intervencion.diagnostico && (
                <p className="text-[10px] text-[#5D6D7E] mb-2">{intervencion.diagnostico}</p>
              )}
              <div className="flex items-center justify-between text-[10px] text-[#5D6D7E]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(intervencion.fecha).toLocaleDateString('es-ES')}
                </span>
                {intervencion.manoDeObra && (
                  <span className="font-bold text-[#1A5276]">${Number(intervencion.manoDeObra).toFixed(2)}</span>
                )}
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
        <Link to="/mobile/mechanic/customers" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
        <Link to="/mobile/mechanic/interventions" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Servicios</span>
        </Link>
      </nav>
    </div>
  )
}
