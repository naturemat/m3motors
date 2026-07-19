import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Search, Camera, Car } from 'lucide-react'
import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function MobileMechanicQRScanner() {
  const navigate = useNavigate()
  const [qrInput, setQrInput] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [recognizing, setRecognizing] = useState(false)
  const [result, setResult] = useState<{ placa: string; vehicleExists: boolean; vehicle: any } | null>(null)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const handleSearch = () => {
    if (qrInput.trim()) {
      navigate(`/mobile/mechanic/vehicle/0?qr=${encodeURIComponent(qrInput.trim())}`)
    }
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target?.result as string
      setPhotoPreview(base64)
      setRecognizing(true)
      setResult(null)

      try {
        const headers = { Authorization: `Bearer ${mobileUser.token}` }
        const res = await axios.post(`${apiUrl}/vehicles/recognize-plate`, {
          fotoBase64: base64,
          mimeType: file.type,
        }, { headers })
        setResult(res.data)
      } catch (err) {
        console.error('[QRScanner] Error:', err)
      } finally {
        setRecognizing(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const goToVehicle = () => {
    if (result?.vehicleExists && result.vehicle) {
      navigate(`/mobile/mechanic/vehicle/${result.vehicle.id}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Escanear QR</h1>
      </header>

      <div className="px-5 py-6 space-y-6">
        {/* Camera Input */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]/60">
          <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">Foto del vehiculo</h3>
          <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-[#E2E8F0] rounded-xl cursor-pointer hover:border-[#1A5276] transition-colors">
            <Camera className="w-8 h-8 text-[#5D6D7E]" />
            <span className="text-xs text-[#5D6D7E]">Toma una foto de la placa o escanea el QR</span>
            <input type="file" accept="image/*" capture="environment" onChange={handlePhotoSelect} className="hidden" />
          </label>

          {photoPreview && (
            <div className="mt-4">
              <img src={photoPreview} alt="Foto" className="w-full h-48 object-cover rounded-lg" />
            </div>
          )}

          {recognizing && (
            <div className="mt-4 text-center">
              <p className="text-xs text-[#1A5276] font-bold">Reconociendo placa...</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-[#EBF5FB] rounded-xl">
              <p className="text-xs font-bold text-[#1A5276] mb-1">Placa reconocida:</p>
              <p className="text-lg font-bold text-[#2C3E50] font-mono">{result.placa}</p>
              {result.vehicleExists ? (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => navigate(`/mobile/mechanic/vehicle/${result.vehicle.id}/intervene`)}
                    className="flex-1 bg-[#27AE60] text-white py-2 rounded-lg text-xs font-bold"
                  >
                    Registrar Intervencion
                  </button>
                  <button onClick={goToVehicle} className="flex-1 bg-[#1A5276] text-white py-2 rounded-lg text-xs font-bold">
                    Ver historial
                  </button>
                </div>
              ) : (
                <p className="text-[10px] text-[#5D6D7E] mt-2">Vehiculo no registrado en el sistema.</p>
              )}
            </div>
          )}
        </div>

        {/* Manual QR Input */}
        <div className="bg-white rounded-xl p-5 border border-[#E2E8F0]/60">
          <h3 className="text-xs font-bold text-[#5D6D7E] uppercase tracking-wider mb-3">Codigo QR manual</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Ej: QR-AB12-CD34"
              className="flex-1 bg-[#F4F6F7] border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276] font-mono"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!qrInput.trim()}
              className={`w-12 rounded-xl flex items-center justify-center transition-colors ${
                qrInput.trim() ? 'bg-[#1A5276] text-white' : 'bg-[#E2E8F0] text-[#5D6D7E]'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/mechanic/scanner" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Escanear</span>
        </Link>
        <Link to="/mobile/mechanic/register-vehicle" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Vehiculo</span>
        </Link>
        <Link to="/mobile/mechanic/manual-intervention" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Revision</span>
        </Link>
        <Link to="/mobile/mechanic/customers" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
        <Link to="/mobile/mechanic/services" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Servicios</span>
        </Link>
      </nav>
    </div>
  )
}
