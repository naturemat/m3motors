import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Calendar, Wrench } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface HistorialItem {
  id: number
  fecha: string
  diagnostico: string | null
  observaciones: string | null
  severidad: string | null
  manoDeObra: number | null
  tipoIntervencion: string
  mecanico?: { nombre: string } | null
  vehiculo?: { placa: string; marca: string; modelo: string } | null
}

export default function MobileClientHistory() {
  const [historial, setHistorial] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      const res = await axios.get(`${apiUrl}/client/dashboard/historial`, { headers })
      setHistorial(res.data.historial ?? [])
    } catch (err) {
      console.error('[MobileClientHistory] Error:', err)
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
        <p className="text-[#5D6D7E] text-xs">Cargando historial...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/client" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Historial del Vehiculo</h1>
      </header>

      {/* List */}
      <div className="px-5 py-4 space-y-3">
        {historial.length === 0 ? (
          <div className="text-center py-12">
            <Wrench className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">No hay intervenciones registradas.</p>
          </div>
        ) : (
          historial.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 shadow-sm"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-[#1A5276]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#2C3E50]">
                      {item.tipoIntervencion}
                    </p>
                    <p className="text-[10px] text-[#5D6D7E]">
                      {item.mecanico?.nombre ?? 'Mecanico'}
                    </p>
                  </div>
                </div>
                {item.severidad && (
                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    item.severidad === 'ALTA' || item.severidad === 'CRITICA'
                      ? 'bg-[#FDEDEC] text-[#E74C3C]'
                      : item.severidad === 'MEDIA'
                      ? 'bg-[#FEF9E7] text-[#F39C12]'
                      : 'bg-[#D5F5E3] text-[#27AE60]'
                  }`}>
                    {item.severidad}
                  </span>
                )}
              </div>

              {item.diagnostico && (
                <p className="text-[11px] text-[#5D6D7E] mb-2 leading-relaxed">
                  {item.diagnostico}
                </p>
              )}

              <div className="flex items-center gap-3 text-[10px] text-[#5D6D7E]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.fecha).toLocaleDateString('es-ES')}
                </span>
                {item.manoDeObra && (
                  <span className="font-bold text-[#1A5276]">
                    ${Number(item.manoDeObra).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/client" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/client/history" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Historial</span>
        </Link>
        <Link to="/mobile/client/qr" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">QR</span>
        </Link>
        <Link to="/mobile/client/profile" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
