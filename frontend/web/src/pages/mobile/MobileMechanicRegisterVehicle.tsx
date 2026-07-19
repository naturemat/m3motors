import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Camera,
  Upload,
  Car,
  User,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Client {
  id: number
  nombre: string
  email: string
  telefono: string
}

type Step = 'photo' | 'form' | 'success'

export default function MobileMechanicRegisterVehicle() {
  const navigate = useNavigate()
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')
  const headers = { Authorization: `Bearer ${mobileUser.token}` }

  const [step, setStep] = useState<Step>('photo')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBase64, setPhotoBase64] = useState<string | null>(null)
  const [mimeType, setMimeType] = useState('image/jpeg')
  const [recognizing, setRecognizing] = useState(false)
  const [ocrError, setOcrError] = useState<string | null>(null)

  const [placa, setPlaca] = useState('')
  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [tipoMotor, setTipoMotor] = useState('Gasolina')
  const [clienteId, setClienteId] = useState<number | null>(null)
  const [clienteSearch, setClienteSearch] = useState('')

  const [clients, setClients] = useState<Client[]>([])
  const [loadingClients, setLoadingClients] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createdVehicle, setCreatedVehicle] = useState<any>(null)

  const fetchClients = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/mechanic/dashboard/clients`, { headers })
      setClients(res.data.clients ?? [])
    } catch (err) {
      console.error('[RegisterVehicle] Error fetching clients:', err)
    } finally {
      setLoadingClients(false)
    }
  }, [])

  useEffect(() => {
    void fetchClients()
  }, [fetchClients])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMimeType(file.type)
    setOcrError(null)

    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result as string
      setPhotoPreview(base64)

      const base64Clean = base64.replace(/^data:image\/\w+;base64,/, '')
      setPhotoBase64(base64Clean)

      setRecognizing(true)
      try {
        const res = await axios.post(`${apiUrl}/vehicles/recognize-plate`, {
          fotoBase64: base64Clean,
          mimeType: file.type,
        }, { headers })

        if (res.data.vehicleExists) {
          setOcrError(`Vehiculo ya registrado: ${res.data.placa}`)
          return
        }

        setPlaca(res.data.placa ?? '')
        setStep('form')
      } catch (err: any) {
        const msg = err?.response?.data?.message ?? 'No se pudo reconocer la placa'
        setOcrError(msg)
      } finally {
        setRecognizing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!placa || !marca || !modelo || !anio || !clienteId) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const createRes = await axios.post(`${apiUrl}/vehicles`, {
        placa,
        marca,
        modelo,
        anio: parseInt(anio),
        tipoMotor,
        clienteId,
      }, { headers })

      const vehicle = createRes.data

      try {
        await axios.post(`${apiUrl}/vehicles/qr/generate/${vehicle.id}`, {}, { headers })
      } catch {
        // QR generation is optional
      }

      setCreatedVehicle(vehicle)
      setStep('success')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Error al registrar vehiculo'
      setSubmitError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredClients = clients.filter((c) =>
    c.nombre.toLowerCase().includes(clienteSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(clienteSearch.toLowerCase())
  )

  const currentYear = new Date().getFullYear()

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <button
          onClick={() => step === 'photo' ? navigate(-1) : setStep(step === 'success' ? 'photo' : 'photo')}
          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">
          {step === 'photo' && 'Tomar Foto'}
          {step === 'form' && 'Datos del Vehiculo'}
          {step === 'success' && 'Registro Exitoso'}
        </h1>
      </header>

      {/* Step: Photo */}
      {step === 'photo' && (
        <div className="px-5 py-6 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]/60 text-center">
            <Car className="w-12 h-12 text-[#1A5276] mx-auto mb-3" />
            <p className="text-sm font-bold text-[#2C3E50] mb-1">Foto del vehiculo</p>
            <p className="text-[10px] text-[#5D6D7E] mb-4">
              Toma una foto de la placa del vehiculo. El sistema reconocera la placa automaticamente.
            </p>

            <label className="block">
              <div className="bg-[#1A5276] text-white rounded-xl py-3.5 px-4 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform">
                <Camera className="w-5 h-5" />
                <span className="text-sm font-bold">Tomar Foto</span>
              </div>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            <div className="mt-3">
              <label className="block">
                <div className="bg-white border border-[#E2E8F0] rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform">
                  <Upload className="w-4 h-4 text-[#5D6D7E]" />
                  <span className="text-xs font-bold text-[#5D6D7E]">Elegir de galeria</span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {recognizing && (
            <div className="bg-[#EBF5FB] rounded-xl p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-[#1A5276] animate-spin" />
              <p className="text-xs text-[#1A5276] font-medium">Reconociendo placa...</p>
            </div>
          )}

          {photoPreview && !recognizing && (
            <div className="bg-white rounded-xl p-3 border border-[#E2E8F0]/60">
              <img
                src={photoPreview}
                alt="Foto del vehiculo"
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {ocrError && (
            <div className="bg-[#FEF9E7] border border-[#F39C12]/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-[#F39C12] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#2C3E50]">{ocrError}</p>
                <button
                  onClick={() => { setOcrError(null); setPhotoPreview(null) }}
                  className="text-[10px] text-[#1A5276] font-bold mt-1"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step: Form */}
      {step === 'form' && (
        <div className="px-5 py-6 space-y-4">
          {/* Photo thumbnail */}
          {photoPreview && (
            <div className="bg-white rounded-xl p-3 border border-[#E2E8F0]/60 flex items-center gap-3">
              <img
                src={photoPreview}
                alt="Foto"
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div>
                <p className="text-xs font-bold text-[#2C3E50]">Foto capturada</p>
                <p className="text-[10px] text-[#5D6D7E]">Placa reconocida: {placa}</p>
              </div>
            </div>
          )}

          {/* Vehicle fields */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Datos del vehiculo</h3>

            <div>
              <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Placa</label>
              <input
                type="text"
                value={placa}
                onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                placeholder="ABC-1234"
                className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] font-mono uppercase focus:outline-none focus:border-[#1A5276]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Marca</label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Toyota"
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Modelo</label>
                <input
                  type="text"
                  value={modelo}
                  onChange={(e) => setModelo(e.target.value)}
                  placeholder="Corolla"
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Anio</label>
                <input
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  placeholder="2020"
                  min={1900}
                  max={currentYear + 1}
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-[#5D6D7E] uppercase tracking-wider mb-1">Motor</label>
                <select
                  value={tipoMotor}
                  onChange={(e) => setTipoMotor(e.target.value)}
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                >
                  <option value="Gasolina">Gasolina</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electrico">Electrico</option>
                  <option value="Hibrido">Hibrido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Client selector */}
          <div className="bg-white rounded-xl p-4 border border-[#E2E8F0]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider">Cliente propietario</h3>

            {loadingClients ? (
              <p className="text-xs text-[#5D6D7E]">Cargando clientes...</p>
            ) : clients.length === 0 ? (
              <div className="text-center py-4">
                <User className="w-8 h-8 text-[#5D6D7E] mx-auto mb-2" />
                <p className="text-xs text-[#5D6D7E]">No hay clientes registrados</p>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  placeholder="Buscar cliente por nombre o email..."
                  className="w-full bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
                />
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredClients.map((client) => (
                    <button
                      key={client.id}
                      onClick={() => { setClienteId(client.id); setClienteSearch('') }}
                      className={`w-full text-left p-3 rounded-xl border transition-all ${
                        clienteId === client.id
                          ? 'bg-[#EBF5FB] border-[#1A5276]'
                          : 'bg-[#F4F6F7] border-[#E2E8F0]/60'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#2C3E50]">{client.nombre}</p>
                      <p className="text-[10px] text-[#5D6D7E]">{client.email}</p>
                    </button>
                  ))}
                </div>
              </>
            )}

            {clienteId && (
              <div className="bg-[#D5F5E3] rounded-xl p-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#27AE60]" />
                <p className="text-xs text-[#27AE60] font-bold">
                  Seleccionado: {clients.find(c => c.id === clienteId)?.nombre}
                </p>
                <button
                  onClick={() => setClienteId(null)}
                  className="ml-auto text-[10px] text-[#5D6D7E] font-bold"
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {submitError && (
            <div className="bg-[#FDEDEC] border border-[#E74C3C]/20 rounded-xl p-3">
              <p className="text-xs text-[#E74C3C]">{submitError}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={submitting || !placa || !marca || !modelo || !anio || !clienteId}
            className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all ${
              submitting || !placa || !marca || !modelo || !anio || !clienteId
                ? 'bg-[#E2E8F0] text-[#5D6D7E]'
                : 'bg-[#27AE60] text-white active:scale-95'
            }`}
          >
            {submitting ? 'Registrando...' : 'Registrar Vehiculo'}
          </button>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && (
        <div className="px-5 py-6 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-[#E2E8F0]/60 text-center">
            <div className="w-16 h-16 bg-[#D5F5E3] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-[#27AE60]" />
            </div>
            <h2 className="text-lg font-bold text-[#2C3E50] mb-1">Vehiculo Registrado</h2>
            <p className="text-xs text-[#5D6D7E] mb-4">
              El vehiculo ha sido registrado exitosamente.
            </p>

            {createdVehicle && (
              <div className="bg-[#F4F6F7] rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#5D6D7E] font-bold uppercase">Placa</span>
                  <span className="text-xs font-bold text-[#2C3E50] font-mono">{createdVehicle.placa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#5D6D7E] font-bold uppercase">Vehiculo</span>
                  <span className="text-xs font-bold text-[#2C3E50]">{createdVehicle.marca} {createdVehicle.modelo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[10px] text-[#5D6D7E] font-bold uppercase">Anio</span>
                  <span className="text-xs font-bold text-[#2C3E50]">{createdVehicle.anio}</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/mobile/mechanic/vehicle/${createdVehicle?.id}`)}
              className="flex-1 bg-[#1A5276] text-white py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              Ver vehiculo
            </button>
            <button
              onClick={() => { setStep('photo'); setPhotoPreview(null); setPlaca(''); setMarca(''); setModelo(''); setAnio(''); setClienteId(null); setCreatedVehicle(null) }}
              className="flex-1 bg-white border border-[#E2E8F0] text-[#2C3E50] py-3 rounded-xl text-xs font-bold active:scale-95 transition-transform"
            >
              Registrar otro
            </button>
          </div>

          <button
            onClick={() => navigate('/mobile/mechanic')}
            className="w-full text-center text-xs text-[#5D6D7E] font-bold py-2"
          >
            Volver al inicio
          </button>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <button onClick={() => navigate('/mobile/mechanic')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/scanner')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Escanear</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#27AE60]">
          <span className="text-[9px] font-bold">Vehiculo</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/manual-intervention')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Revision</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/customers')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </button>
        <button onClick={() => navigate('/mobile/mechanic/services')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Servicios</span>
        </button>
      </nav>
    </div>
  )
}
