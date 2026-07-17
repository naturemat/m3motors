import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { ArrowLeft, QrCode, Copy, Check } from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function MobileClientQR() {
  const { getToken } = useAuth()
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [qrImage, setQrImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      const vehiculosRes = await axios.get(`${apiUrl}/client/dashboard/vehiculos`, { headers })
      const vehiculos = vehiculosRes.data.vehiculos ?? []
      if (vehiculos.length > 0) {
        const v = vehiculos[0]
        if (v.qr?.codigo) {
          setQrCode(v.qr.codigo)
          // Get QR image
          try {
            const qrRes = await axios.get(`${apiUrl}/vehicles/${v.id}/qr-image`, { headers })
            setQrImage(qrRes.data.qrImage)
          } catch {
            // QR image not available
          }
        }
      }
    } catch (err) {
      console.error('[MobileClientQR] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const copyCode = async () => {
    if (qrCode) {
      await navigator.clipboard.writeText(qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <p className="text-[#5D6D7E] text-xs">Cargando QR...</p>
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
        <h1 className="text-base font-bold">Mi Codigo QR</h1>
      </header>

      {/* QR Display */}
      <div className="px-5 py-8 flex flex-col items-center">
        {qrCode ? (
          <>
            <div className="bg-white rounded-2xl p-6 shadow-md border border-[#E2E8F0]/60 mb-6">
              {qrImage ? (
                <img src={qrImage} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 bg-[#F4F6F7] rounded-xl flex items-center justify-center">
                  <QrCode className="w-20 h-20 text-[#1A5276]" />
                </div>
              )}
            </div>

            <p className="text-xs text-[#5D6D7E] mb-2">Tu codigo QR</p>
            <div className="flex items-center gap-2 mb-6">
              <code className="bg-white px-4 py-2 rounded-lg text-sm font-mono text-[#2C3E50] border border-[#E2E8F0]">
                {qrCode}
              </code>
              <button
                onClick={copyCode}
                className="w-8 h-8 bg-[#1A5276] rounded-lg flex items-center justify-center text-white"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-[10px] text-[#5D6D7E] text-center max-w-xs">
              Muestra este codigo al mecanico para acceso rapido al historial de tu vehiculo.
            </p>
          </>
        ) : (
          <div className="text-center py-12">
            <QrCode className="w-12 h-12 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">
              Tu vehiculo aun no tiene codigo QR generado.
            </p>
            <p className="text-[10px] text-[#5D6D7E] mt-1">
              El mecanico lo generara durante la proxima visita.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/client" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/client/history" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Historial</span>
        </Link>
        <Link to="/mobile/client/qr" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">QR</span>
        </Link>
        <Link to="/mobile/client/profile" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
