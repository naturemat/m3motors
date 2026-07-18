import { useState, useEffect, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, Car, Wrench, Calendar, AlertTriangle, QrCode } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Vehiculo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  ultimoKilometraje: number
  qr?: { codigo: string }
  intervenciones?: any[]
  alertas?: any[]
}

export default function MobileMechanicVehicleHistory() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const qrCode = searchParams.get('qr')
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')
  const [vehicle, setVehicle] = useState<Vehiculo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }

      if (qrCode) {
        // Search by QR code
        const res = await axios.get(`${apiUrl}/vehicles/qr/${qrCode}`, { headers })
        if (res.data && !res.data.error) {
          setVehicle(res.data)
        } else {
          setError(res.data.error ?? 'Codigo QR no valido')
        }
      } else if (id && id !== '0') {
        // Get by ID
        const res = await axios.get(`${apiUrl}/vehicles/${id}`, { headers })
        if (res.data && !res.data.error) {
          setVehicle(res.data)
        } else {
          setError(res.data.error ?? 'Vehiculo no encontrado')
        }
      } else {
        setError('No se proporciono un codigo QR o ID valido')
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al buscar vehiculo')
    } finally {
      setLoading(false)
    }
  }, [id, qrCode])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <p className="text-[#5D6D7E] text-xs">Buscando vehiculo...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Historial del Vehiculo</h1>
      </header>

      {error ? (
        <div className="px-5 py-12 text-center">
          <AlertTriangle className="w-12 h-12 text-[#F39C12] mx-auto mb-3" />
          <p className="text-sm text-[#5D6D7E]">{error}</p>
          <Link
            to="/mobile/mechanic/scanner"
            className="inline-flex items-center gap-2 mt-4 bg-[#1A5276] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
          >
            <QrCode className="w-4 h-4" />
            Intentar de nuevo
          </Link>
        </div>
      ) : vehicle ? (
        <div className="px-5 py-4 space-y-4">
          {/* Vehicle Info */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-[#E2E8F0]/60">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-[#1A5276]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#2C3E50]">
                  {vehicle.marca} {vehicle.modelo}
                </h2>
                <p className="text-[10px] text-[#5D6D7E] font-mono uppercase">
                  {vehicle.placa} · {vehicle.anio}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F4F6F7] rounded-lg p-3">
                <p className="text-[9px] text-[#5D6D7E] font-bold uppercase">Kilometraje</p>
                <p className="text-sm font-bold text-[#2C3E50]">
                  {vehicle.ultimoKilometraje.toLocaleString()} km
                </p>
              </div>
              <div className="bg-[#F4F6F7] rounded-lg p-3">
                <p className="text-[9px] text-[#5D6D7E] font-bold uppercase">QR</p>
                <p className="text-[10px] font-mono text-[#2C3E50] truncate">
                  {vehicle.qr?.codigo ?? 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {vehicle.alertas && vehicle.alertas.length > 0 && (
            <div className="bg-[#FEF9E7] rounded-xl p-4 border border-[#F39C12]/20">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-[#F39C12]" />
                <span className="text-xs font-bold text-[#2C3E50]">
                  Alertas Activas ({vehicle.alertas.length})
                </span>
              </div>
              {vehicle.alertas.slice(0, 3).map((alerta: any, i: number) => (
                <p key={i} className="text-[10px] text-[#5D6D7E] mb-1">
                  · {alerta.componenteAfectado}: {alerta.mensajePrediccion}
                </p>
              ))}
            </div>
          )}

          {/* Intervention History */}
          <div>
            <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">
              Historial de Intervenciones
            </h3>
            {vehicle.intervenciones && vehicle.intervenciones.length > 0 ? (
              <div className="space-y-2">
                {vehicle.intervenciones.map((intervencion: any) => (
                  <div
                    key={intervencion.id}
                    className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-[#1A5276]" />
                        <span className="text-xs font-bold text-[#2C3E50]">
                          {intervencion.tipoIntervencion}
                        </span>
                      </div>
                      {intervencion.severidad && (
                        <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          intervencion.severidad === 'ALTA' || intervencion.severidad === 'CRITICA'
                            ? 'bg-[#FDEDEC] text-[#E74C3C]'
                            : 'bg-[#D5F5E3] text-[#27AE60]'
                        }`}>
                          {intervencion.severidad}
                        </span>
                      )}
                    </div>
                    {intervencion.diagnostico && (
                      <p className="text-[10px] text-[#5D6D7E] mb-2">{intervencion.diagnostico}</p>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-[#5D6D7E]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(intervencion.fecha).toLocaleDateString('es-ES')}
                      </span>
                      <span className="font-mono">
                        {intervencion.kilometrajeOdometro?.toLocaleString()} km
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 text-center border border-[#E2E8F0]/60">
                <Wrench className="w-8 h-8 text-[#5D6D7E] mx-auto mb-2" />
                <p className="text-xs text-[#5D6D7E]">No hay intervenciones registradas.</p>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Bottom Nav */}
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
        <Link to="/mobile/mechanic/interventions" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Servicios</span>
        </Link>
      </nav>
    </div>
  )
}
