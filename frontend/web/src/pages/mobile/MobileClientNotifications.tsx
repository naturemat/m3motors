import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  Bell,
  BellRing,
  Wrench,
  Car,
  User,
  Home,
  History,
  QrCode,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Notificacion {
  id: string
  tipo_notificacion: string
  canal: string
  asunto: string | null
  contenido: string
  estado: string
  created_at: string
}

const tipoIcons: Record<string, typeof Bell> = {
  ALERTA_MANTENIMIENTO: Wrench,
  INTERVENCION_CREADA: Wrench,
  RECOMENDACION: Car,
  RECORDATORIO: Bell,
  BIENVENIDA: User,
  VEHICULO_REGISTRADO: Car,
  CLIENTE_ACTIVADO: User,
}

const tipoColors: Record<string, string> = {
  ALERTA_MANTENIMIENTO: 'bg-[#FEF9E7] text-[#F39C12]',
  INTERVENCION_CREADA: 'bg-[#EBF5FB] text-[#1A5276]',
  RECOMENDACION: 'bg-[#D5F5E3] text-[#27AE60]',
  RECORDATORIO: 'bg-[#F4F6F7] text-[#5D6D7E]',
  BIENVENIDA: 'bg-[#EBF5FB] text-[#2E86C1]',
  VEHICULO_REGISTRADO: 'bg-[#D5F5E3] text-[#27AE60]',
  CLIENTE_ACTIVADO: 'bg-[#D5F5E3] text-[#27AE60]',
}

export default function MobileClientNotifications() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')

  const fetchData = useCallback(async () => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      const clienteId = mobileUser.userId

      const [notifsRes, countRes] = await Promise.all([
        axios.get(`${apiUrl}/notifications/client/${clienteId}`, { headers }),
        axios.get(`${apiUrl}/notifications/client/${clienteId}/unread/count`, { headers }),
      ])

      setNotificaciones(notifsRes.data ?? [])
      setUnreadCount(countRes.data?.count ?? 0)
    } catch (err) {
      console.error('[MobileClientNotifications] Error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const markAsRead = async (id: string) => {
    try {
      const headers = { Authorization: `Bearer ${mobileUser.token}` }
      await axios.patch(`${apiUrl}/notifications/${id}/read`, {}, { headers })
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estado: 'enviada' } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (err) {
      console.error('[MobileClientNotifications] Error marking as read:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <p className="text-[#5D6D7E] text-xs">Cargando notificaciones...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <Link to="/mobile/client" className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-bold">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="text-[10px] text-[#D6EAF8]">{unreadCount} sin leer</span>
          )}
        </div>
      </header>

      <div className="px-5 py-4 space-y-3">
        {notificaciones.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
            <p className="text-sm text-[#5D6D7E]">No tienes notificaciones aun.</p>
          </div>
        ) : (
          notificaciones.map((notif) => {
            const Icon = tipoIcons[notif.tipo_notificacion] ?? Bell
            const colorClass = tipoColors[notif.tipo_notificacion] ?? 'bg-[#F4F6F7] text-[#5D6D7E]'
            const isUnread = notif.estado === 'pendiente'

            return (
              <div
                key={notif.id}
                onClick={() => isUnread && markAsRead(notif.id)}
                className={`bg-white rounded-xl p-4 border transition-all cursor-pointer ${
                  isUnread
                    ? 'border-[#1A5276]/30 shadow-sm'
                    : 'border-[#E2E8F0]/60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-xs font-bold ${isUnread ? 'text-[#1A5276]' : 'text-[#2C3E50]'}`}>
                        {notif.asunto ?? notif.tipo_notificacion}
                      </p>
                      {isUnread && (
                        <span className="w-2 h-2 bg-[#1A5276] rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-[#5D6D7E] leading-relaxed">
                      {notif.contenido}
                    </p>
                    <p className="text-[9px] text-[#5D6D7E] mt-1">
                      {new Date(notif.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] flex justify-around items-center h-16 z-40">
        <Link to="/mobile/client" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <Home className="w-5 h-5" />
          <span className="text-[9px] font-bold">Inicio</span>
        </Link>
        <Link to="/mobile/client/history" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <History className="w-5 h-5" />
          <span className="text-[9px] font-bold">Historial</span>
        </Link>
        <Link to="/mobile/client/notifications" className="flex flex-col items-center gap-1 text-[#1A5276]">
          <BellRing className="w-5 h-5" />
          <span className="text-[9px] font-bold">Alertas</span>
        </Link>
        <Link to="/mobile/client/qr" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <QrCode className="w-5 h-5" />
          <span className="text-[9px] font-bold">QR</span>
        </Link>
        <Link to="/mobile/client/profile" className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <User className="w-5 h-5" />
          <span className="text-[9px] font-bold">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
