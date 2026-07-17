import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, QrCode, Search } from 'lucide-react'

export default function MobileMechanicQRScanner() {
  const navigate = useNavigate()
  const [qrInput, setQrInput] = useState('')

  const handleSearch = () => {
    if (qrInput.trim()) {
      // Navigate to a search result page or use the vehicle lookup
      // For now, we'll use the vehicle QR endpoint
      navigate(`/mobile/mechanic/vehicle/0?qr=${encodeURIComponent(qrInput.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      {/* Header */}
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/mechanic" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-base font-bold">Escanear QR</h1>
      </header>

      {/* Scanner Area */}
      <div className="px-5 py-8 flex flex-col items-center">
        {/* Simulated scanner frame */}
        <div className="w-56 h-56 bg-[#2C3E50] rounded-2xl relative overflow-hidden flex items-center justify-center mb-8">
          {/* Corner markers */}
          <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[#2E86C1] rounded-tl-lg" />
          <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[#2E86C1] rounded-tr-lg" />
          <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[#2E86C1] rounded-bl-lg" />
          <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[#2E86C1] rounded-br-lg" />

          <QrCode className="w-16 h-16 text-white/20" />

          {/* Animated line */}
          <div className="absolute top-0 left-4 right-4 h-0.5 bg-[#2E86C1] animate-[bounce_2s_infinite]" />
        </div>

        <p className="text-xs text-[#5D6D7E] text-center mb-6 max-w-xs">
          Ingresa el codigo QR del vehiculo manualmente o escanealo con la camara.
        </p>

        {/* Manual Input */}
        <div className="w-full max-w-sm">
          <div className="flex gap-2">
            <input
              type="text"
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Ingresa el codigo QR..."
              className="flex-1 bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={!qrInput.trim()}
              className={`w-12 rounded-xl flex items-center justify-center transition-colors ${
                qrInput.trim()
                  ? 'bg-[#1A5276] text-white'
                  : 'bg-[#E2E8F0] text-[#5D6D7E]'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Dashboard</span>
        </Link>
        <Link to="/mobile/mechanic/scanner" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Escanear</span>
        </Link>
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Clientes</span>
        </Link>
        <Link to="/mobile/mechanic" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Ajustes</span>
        </Link>
      </nav>
    </div>
  )
}
