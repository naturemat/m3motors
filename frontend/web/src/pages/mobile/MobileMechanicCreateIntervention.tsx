import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Wrench,
  Camera,
  CheckCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Search,
  X,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface VehicleInfo {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  ultimoKilometraje: number
  tipoMotor?: string
}

interface ServiceItem {
  id: number
  nombre: string
  descripcion: string | null
  categoria: string
  precioReferencia: number | null
}

interface PartItem {
  id: number
  categoria: string
  subcategoria: string
  nombre: string
  vidaUtilKm: number
  marcasComunes: string | null
}

interface DetalleItem {
  componenteReemplazado: string
  tipoServicio: string
  limiteKilometraje: number
  marcaRepuesto: string
  calidadRepuesto: string
  partsCatalogId: number | null
}

interface FotoItem {
  base64: string
  mimeType: string
  tipo: 'ANTES' | 'DURANTE' | 'DESPUES' | 'DETALLE'
  preview?: string
}

type Step = 'form' | 'success'

export default function MobileMechanicCreateIntervention() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')
  const headers = { Authorization: `Bearer ${mobileUser.token}` }

  const [vehicle, setVehicle] = useState<VehicleInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [tipoIntervencion, setTipoIntervencion] = useState('PREVENTIVO')
  const [serviceCatalogId, setServiceCatalogId] = useState<number | null>(null)
  const [diagnostico, setDiagnostico] = useState('')
  const [severidad, setSeveridad] = useState('MEDIA')
  const [manoDeObra, setManoDeObra] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [kilometraje, setKilometraje] = useState('')

  const [detalles, setDetalles] = useState<DetalleItem[]>([])
  const [fotos, setFotos] = useState<FotoItem[]>([])

  const [services, setServices] = useState<ServiceItem[]>([])
  const [parts, setParts] = useState<PartItem[]>([])
  const [partsSearch, setPartsSearch] = useState('')
  const [showPartsPicker, setShowPartsPicker] = useState<number | null>(null)

  const [step, setStep] = useState<Step>('form')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)

  const fetchData = useCallback(async () => {
    if (!id) return
    try {
      const [vehicleRes, servicesRes, partsRes] = await Promise.all([
        axios.get(`${apiUrl}/vehicles/${id}`, { headers }),
        axios.get(`${apiUrl}/mechanic/dashboard/services`, { headers }).catch(() => ({ data: { services: [] } })),
        axios.get(`${apiUrl}/parts-catalog`, { headers }).catch(() => ({ data: [] })),
      ])
      const v = vehicleRes.data
      setVehicle({
        id: v.id,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        ultimoKilometraje: v.ultimoKilometraje ?? 0,
        tipoMotor: v.tipoMotor,
      })
      setKilometraje(String((v.ultimoKilometraje ?? 0) + 100))
      setServices(servicesRes.data.services ?? [])
      setParts(partsRes.data ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleServiceSelect = (service: ServiceItem) => {
    setServiceCatalogId(service.id)
    if (service.nombre) setDiagnostico(service.nombre)
    if (service.precioReferencia) setManoDeObra(String(service.precioReferencia))
  }

  const addDetalle = (part?: PartItem) => {
    setDetalles([...detalles, {
      componenteReemplazado: part?.nombre ?? '',
      tipoServicio: 'REEMPLAZO',
      limiteKilometraje: part?.vidaUtilKm ?? 0,
      marcaRepuesto: part?.marcasComunes?.split(',')[0]?.trim() ?? '',
      calidadRepuesto: 'ORIGINAL',
      partsCatalogId: part?.id ?? null,
    }])
    setShowPartsPicker(null)
    setPartsSearch('')
  }

  const removeDetalle = (idx: number) => {
    setDetalles(detalles.filter((_, i) => i !== idx))
  }

  const updateDetalle = (idx: number, field: keyof DetalleItem, value: string | number | null) => {
    const updated = [...detalles]
    ;(updated[idx] as any)[field] = value
    setDetalles(updated)
  }

  const handleFoto = (e: React.ChangeEvent<HTMLInputElement>, tipo: FotoItem['tipo']) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const base64 = (reader.result as string).replace(/^data:image\/\w+;base64,/, '')
      setFotos([...fotos, { base64, mimeType: file.type, tipo, preview: reader.result as string }])
    }
    reader.readAsDataURL(file)
  }

  const removeFoto = (idx: number) => {
    setFotos(fotos.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!vehicle || !kilometraje || !diagnostico) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const dto: any = {
        vehiculoId: vehicle.id,
        kilometrajeOdometro: parseInt(kilometraje),
        diagnostico,
        severidad,
        tipoIntervencion,
        observaciones: observaciones || undefined,
        manoDeObra: manoDeObra ? parseFloat(manoDeObra) : undefined,
        serviceCatalogId: serviceCatalogId ?? undefined,
      }

      if (detalles.length > 0) {
        dto.detalles = detalles.map(d => ({
          componenteReemplazado: d.componenteReemplazado,
          kilometrajeInstalacion: parseInt(kilometraje),
          limiteKilometraje: d.limiteKilometraje,
          tipoServicio: d.tipoServicio,
          marcaRepuesto: d.marcaRepuesto || undefined,
          calidadRepuesto: d.calidadRepuesto || undefined,
          partsCatalogId: d.partsCatalogId ?? undefined,
        }))
      }

      if (fotos.length > 0) {
        dto.fotos = fotos.map(f => ({
          base64: f.base64,
          mimeType: f.mimeType,
          tipo: f.tipo,
        }))
      }

      const res = await axios.post(`${apiUrl}/interventions`, dto, { headers })
      setResult(res.data)
      setStep('success')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar intervencion'
      setSubmitError(Array.isArray(msg) ? msg.join(', ') : msg)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredParts = partsSearch
    ? parts.filter(p =>
        p.nombre.toLowerCase().includes(partsSearch.toLowerCase()) ||
        p.categoria.toLowerCase().includes(partsSearch.toLowerCase()) ||
        p.subcategoria.toLowerCase().includes(partsSearch.toLowerCase())
      )
    : parts.slice(0, 20)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#1A5276] mx-auto mb-3 animate-spin" />
          <p className="text-[#5D6D7E] text-xs">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center px-5">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-[#E74C3C] mx-auto mb-3" />
          <p className="text-sm text-[#2C3E50] font-bold mb-2">{error}</p>
          <button onClick={() => navigate(-1)} className="text-xs text-[#1A5276] font-bold">Volver</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">{step === 'form' ? 'Registrar Intervencion' : 'Intervencion Registrada'}</h1>
      </header>

      {step === 'form' && (
        <div className="px-5 py-5 space-y-4">
          {/* Vehicle info */}
          {vehicle && (
            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-[#1A5276]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#2C3E50]">{vehicle.marca} {vehicle.modelo}</p>
                  <p className="text-[10px] text-[#5D6D7E] font-mono uppercase">{vehicle.placa} - {vehicle.anio}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="bg-[#F4F6F7] rounded-lg p-2">
                  <p className="text-[9px] text-[#5D6D7E] font-bold uppercase">Km Actual</p>
                  <p className="text-xs font-bold text-[#2C3E50]">{vehicle.ultimoKilometraje.toLocaleString()} km</p>
                </div>
                <div className="bg-[#F4F6F7] rounded-lg p-2">
                  <p className="text-[9px] text-[#5D6D7E] font-bold uppercase">Motor</p>
                  <p className="text-xs font-bold text-[#2C3E50]">{vehicle.tipoMotor ?? 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* ServiceCatalog Picker */}
          {services.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-2">
              <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Servicio del catalogo</h3>
              <div className="flex flex-wrap gap-2">
                {services.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleServiceSelect(s)}
                    className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all ${
                      serviceCatalogId === s.id
                        ? 'bg-[#1A5276] text-white border-[#1A5276]'
                        : 'bg-[#F4F6F7] text-[#5D6D7E] border-[#E2E8F0]'
                    }`}
                  >
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Datos de la intervencion */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Datos de la intervencion</h3>

            <div>
              <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Tipo de intervencion</label>
              <select value={tipoIntervencion} onChange={(e) => setTipoIntervencion(e.target.value)}
                className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]">
                <option value="PREVENTIVO">Preventivo</option>
                <option value="CORRECTIVO">Correctivo</option>
                <option value="PREDICTIVO">Predictivo</option>
                <option value="DIAGNOSTICO">Diagnostico</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Kilometraje actual</label>
              <input type="number" value={kilometraje} onChange={(e) => setKilometraje(e.target.value)}
                placeholder="Ej: 46000"
                className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
              <p className="text-[9px] text-[#5D6D7E] mt-1">Debe ser mayor a {vehicle?.ultimoKilometraje.toLocaleString()} km</p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Diagnostico *</label>
              <textarea value={diagnostico} onChange={(e) => setDiagnostico(e.target.value)}
                placeholder="Describe el diagnostico del vehiculo..." rows={3}
                className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276] resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Severidad</label>
                <select value={severidad} onChange={(e) => setSeveridad(e.target.value)}
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]">
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="CRITICA">Critica</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Mano de obra ($)</label>
                <input type="number" value={manoDeObra} onChange={(e) => setManoDeObra(e.target.value)}
                  placeholder="0.00" step="0.01"
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Observaciones</label>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)}
                placeholder="Notas adicionales..." rows={2}
                className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276] resize-none" />
            </div>
          </div>

          {/* Componentes reemplazados */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Componentes reemplazados</h3>
              <div className="flex gap-2">
                {parts.length > 0 && (
                  <button onClick={() => setShowPartsPicker(showPartsPicker === null ? -1 : null)}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#2E86C1]">
                    <Search className="w-3 h-3" /> Catalogo
                  </button>
                )}
                <button onClick={() => addDetalle()} className="flex items-center gap-1 text-[10px] font-bold text-[#1A5276]">
                  <Plus className="w-3 h-3" /> Manual
                </button>
              </div>
            </div>

            {/* Parts Catalog Picker */}
            {showPartsPicker !== null && (
              <div className="bg-[#F4F6F7] rounded-xl p-3 space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-[#5D6D7E]" />
                  <input type="text" value={partsSearch} onChange={(e) => setPartsSearch(e.target.value)}
                    placeholder="Buscar pieza..."
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg pl-8 pr-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {filteredParts.map(p => (
                    <button key={p.id} onClick={() => addDetalle(p)}
                      className="w-full text-left bg-white rounded-lg p-2 border border-[#E2E8F0]/60 hover:border-[#1A5276] transition-colors">
                      <p className="text-[10px] font-bold text-[#2C3E50]">{p.nombre}</p>
                      <p className="text-[9px] text-[#5D6D7E]">{p.categoria} / {p.subcategoria} - {p.vidaUtilKm.toLocaleString()} km</p>
                    </button>
                  ))}
                  {filteredParts.length === 0 && (
                    <p className="text-[10px] text-[#5D6D7E] text-center py-2">No se encontraron piezas</p>
                  )}
                </div>
                <button onClick={() => { setShowPartsPicker(null); setPartsSearch('') }}
                  className="w-full text-[10px] font-bold text-[#5D6D7E] py-1">
                  Cerrar
                </button>
              </div>
            )}

            {detalles.length === 0 && (
              <p className="text-[10px] text-[#5D6D7E]">Sin componentes registrados</p>
            )}

            {detalles.map((d, idx) => (
              <div key={idx} className="bg-[#F4F6F7] rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#5D6D7E]">Componente {idx + 1}</span>
                  <button onClick={() => removeDetalle(idx)} className="text-[#E74C3C]">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <input type="text" value={d.componenteReemplazado}
                  onChange={(e) => updateDetalle(idx, 'componenteReemplazado', e.target.value)}
                  placeholder="Nombre del componente"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
                <div className="grid grid-cols-2 gap-2">
                  <select value={d.tipoServicio}
                    onChange={(e) => updateDetalle(idx, 'tipoServicio', e.target.value)}
                    className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]">
                    <option value="REEMPLAZO">Reemplazo</option>
                    <option value="REPARACION">Reparacion</option>
                    <option value="LUBRICACION">Lubricacion</option>
                    <option value="AJUSTE">Ajuste</option>
                    <option value="LIMPIEZA">Limpieza</option>
                  </select>
                  <select value={d.calidadRepuesto}
                    onChange={(e) => updateDetalle(idx, 'calidadRepuesto', e.target.value)}
                    className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]">
                    <option value="ORIGINAL">Original</option>
                    <option value="ALTERNATIVO">Alternativo</option>
                    <option value="REACONDICIONADO">Reacondicionado</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={d.limiteKilometraje || ''}
                    onChange={(e) => updateDetalle(idx, 'limiteKilometraje', parseInt(e.target.value) || 0)}
                    placeholder="Limite km"
                    className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
                  <input type="text" value={d.marcaRepuesto}
                    onChange={(e) => updateDetalle(idx, 'marcaRepuesto', e.target.value)}
                    placeholder="Marca repuesto"
                    className="bg-white border border-[#E2E8F0] rounded-lg px-3 py-2 text-xs text-[#2C3E50] focus:outline-none focus:border-[#1A5276]" />
                </div>
              </div>
            ))}
          </div>

          {/* Fotos */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Fotos</h3>

            <div className="grid grid-cols-4 gap-2">
              {(['ANTES', 'DURANTE', 'DESPUES', 'DETALLE'] as const).map((tipo) => (
                <label key={tipo} className="block">
                  <div className="bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl p-2 text-center cursor-pointer active:scale-95 transition-transform">
                    <Camera className="w-4 h-4 text-[#5D6D7E] mx-auto mb-0.5" />
                    <span className="text-[8px] font-bold text-[#5D6D7E]">{tipo}</span>
                  </div>
                  <input type="file" accept="image/*" capture="environment"
                    onChange={(e) => handleFoto(e, tipo)} className="hidden" />
                </label>
              ))}
            </div>

            {fotos.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {fotos.map((f, idx) => (
                  <div key={idx} className="relative">
                    {f.preview ? (
                      <img src={f.preview} alt={f.tipo} className="w-16 h-16 object-cover rounded-lg border border-[#E2E8F0]" />
                    ) : (
                      <div className="w-16 h-16 bg-[#EBF5FB] rounded-lg flex items-center justify-center">
                        <Camera className="w-4 h-4 text-[#1A5276]" />
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 flex items-center gap-0.5">
                      <span className="text-[7px] font-bold text-white bg-[#1A5276] px-1 rounded">{f.tipo}</span>
                      <button onClick={() => removeFoto(idx)} className="w-4 h-4 bg-[#E74C3C] rounded-full flex items-center justify-center">
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-[#FDEDEC] border border-[#E74C3C]/20 rounded-xl p-3">
              <p className="text-xs text-[#E74C3C]">{submitError}</p>
            </div>
          )}

          <button onClick={handleSubmit}
            disabled={submitting || !kilometraje || !diagnostico}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              submitting || !kilometraje || !diagnostico
                ? 'bg-[#E2E8F0] text-[#5D6D7E]'
                : 'bg-[#27AE60] text-white active:scale-95'
            }`}>
            {submitting ? 'Registrando...' : 'Registrar Intervencion'}
          </button>
        </div>
      )}

      {step === 'success' && (
        <div className="px-5 py-6 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]/60 text-center">
            <div className="w-16 h-16 bg-[#D5F5E3] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#27AE60]" />
            </div>
            <h2 className="text-lg font-bold text-[#2C3E50] mb-1">Intervencion Registrada</h2>
            <p className="text-xs text-[#5D6D7E] mb-2">El servicio ha sido registrado exitosamente.</p>
            {result?.intervention?.fotos && result.intervention.fotos.length > 0 && (
              <p className="text-[10px] text-[#27AE60] font-bold">{result.intervention.fotos.length} foto(s) subida(s)</p>
            )}
            {result?.intervention?.detalles && result.intervention.detalles.length > 0 && (
              <p className="text-[10px] text-[#27AE60] font-bold">{result.intervention.detalles.length} componente(s) registrado(s)</p>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/mobile/mechanic')}
              className="flex-1 bg-[#1A5276] text-white py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform">
              Volver al inicio
            </button>
            <button onClick={() => navigate(`/mobile/mechanic/vehicle/${id}`)}
              className="flex-1 bg-white border border-[#E2E8F0] text-[#2C3E50] py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform">
              Ver historial
            </button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <button onClick={() => navigate('/mobile/mechanic')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/scanner')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Escanear</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/register-vehicle')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Vehiculo</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/customers')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/interventions')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Servicios</span>
        </button>
      </nav>
    </div>
  )
}
