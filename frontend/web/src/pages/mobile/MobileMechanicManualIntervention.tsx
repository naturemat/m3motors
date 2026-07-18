import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft,
  User,
  Car,
  CheckCircle,
  ChevronRight,
} from 'lucide-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Client {
  id: number
  nombre: string
  email: string
  telefono: string
}

interface Vehicle {
  id: number
  placa: string
  marca: string
  modelo: string
  anio: number
  ultimoKilometraje: number
  tipoMotor?: string
}

type Step = 'clients' | 'vehicles'

export default function MobileMechanicManualIntervention() {
  const navigate = useNavigate()
  const mobileUser = JSON.parse(localStorage.getItem('mobile_user') ?? '{}')
  const headers = { Authorization: `Bearer ${mobileUser.token}` }

  const [step, setStep] = useState<Step>('clients')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [search, setSearch] = useState('')

  const fetchClients = useCallback(async () => {
    try {
      const res = await axios.get(`${apiUrl}/mechanic/dashboard/clients`, { headers })
      setClients(res.data.clients ?? [])
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al cargar clientes')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchVehicles = useCallback(async (clientId: number) => {
    try {
      setLoading(true)
      const res = await axios.get(`${apiUrl}/vehicles`, { headers })
      const allVehicles = res.data.vehicles ?? []
      const clientVehicles = allVehicles.filter((v: any) => v.clienteId === clientId)
      setVehicles(clientVehicles.map((v: any) => ({
        id: v.id,
        placa: v.placa,
        marca: v.marca,
        modelo: v.modelo,
        anio: v.anio,
        ultimoKilometraje: v.ultimoKilometraje ?? 0,
        tipoMotor: v.tipoMotor,
      })))
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error al cargar vehiculos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchClients()
  }, [fetchClients])

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client)
    setStep('vehicles')
    void fetchVehicles(client.id)
  }

  const handleVehicleSelect = (vehicle: Vehicle) => {
    navigate(`/mobile/mechanic/vehicle/${vehicle.id}/intervene`)
  }

  const filteredClients = search
    ? clients.filter(c =>
        c.nombre.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.telefono.includes(search)
      )
    : clients

  return (
    <div className="min-h-screen bg-[#F4F6F7] pb-20">
      <header className="bg-[#1A5276] text-white px-5 pt-10 pb-4 flex items-center gap-3">
        <button
          onClick={() => step === 'vehicles' ? setStep('clients') : navigate(-1)}
          className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="text-base font-bold">
          {step === 'clients' ? 'Seleccionar Cliente' : `Vehiculos de ${selectedClient?.nombre}`}
        </h1>
      </header>

      {loading && (
        <div className="px-5 py-8 text-center">
          <p className="text-[#5D6D7E] text-xs">Cargando...</p>
        </div>
      )}

      {error && (
        <div className="px-5 py-4">
          <div className="bg-[#FDEDEC] rounded-xl p-3 text-center">
            <p className="text-xs text-[#E74C3C]">{error}</p>
          </div>
        </div>
      )}

      {!loading && step === 'clients' && (
        <div className="px-5 py-4 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email o telefono..."
              className="w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 text-sm text-[#2C3E50] focus:outline-none focus:border-[#1A5276]"
            />
          </div>

          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
              <p className="text-sm text-[#5D6D7E]">No hay clientes registrados</p>
            </div>
          ) : (
            filteredClients.map((client) => (
              <button
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className="w-full bg-white rounded-xl p-4 border border-[#E2E8F0]/60 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-10 h-10 bg-[#EBF5FB] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-[#1A5276]">
                    {client.nombre.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2C3E50] truncate">{client.nombre}</p>
                  <p className="text-[10px] text-[#5D6D7E]">{client.email}</p>
                  <p className="text-[10px] text-[#5D6D7E]">{client.telefono}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#5D6D7E] shrink-0" />
              </button>
            ))
          )}
        </div>
      )}

      {!loading && step === 'vehicles' && (
        <div className="px-5 py-4 space-y-3">
          {selectedClient && (
            <div className="bg-[#EBF5FB] rounded-xl p-3 flex items-center gap-3">
              <User className="w-4 h-4 text-[#1A5276]" />
              <div>
                <p className="text-xs font-bold text-[#1A5276]">{selectedClient.nombre}</p>
                <p className="text-[9px] text-[#5D6D7E]">{selectedClient.email}</p>
              </div>
            </div>
          )}

          {vehicles.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-10 h-10 text-[#5D6D7E] mx-auto mb-3" />
              <p className="text-sm text-[#5D6D7E] mb-3">Este cliente no tiene vehiculos registrados</p>
              <button
                onClick={() => navigate('/mobile/mechanic/register-vehicle')}
                className="bg-[#27AE60] text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95"
              >
                Registrar vehiculo
              </button>
            </div>
          ) : (
            vehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                onClick={() => handleVehicleSelect(vehicle)}
                className="w-full bg-white rounded-xl p-4 border border-[#E2E8F0]/60 flex items-center gap-3 active:scale-[0.98] transition-transform text-left"
              >
                <div className="w-10 h-10 bg-[#D5F5E3] rounded-lg flex items-center justify-center shrink-0">
                  <Car className="w-5 h-5 text-[#27AE60]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#2C3E50]">{vehicle.marca} {vehicle.modelo}</p>
                  <p className="text-[10px] text-[#5D6D7E] font-mono uppercase">{vehicle.placa} - {vehicle.anio}</p>
                  <p className="text-[10px] text-[#5D6D7E]">{vehicle.ultimoKilometraje.toLocaleString()} km</p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#5D6D7E] shrink-0" />
              </button>
            ))
          )}
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
        <button onClick={() => navigate('/mobile/mechanic/register-vehicle')} className="flex flex-col items-center gap-1 text-[#5D6D7E]">
          <span className="text-[9px] font-bold">Vehiculo</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#1A5276]">
          <span className="text-[9px] font-bold">Revision</span>
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
