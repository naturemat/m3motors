import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

interface Vehiculo {
  id: string
  marca: string
  modelo: string
  anio: number
  placa: string
  kilometrajeActual: number
  qrCode: string
}

interface Servicio {
  id: string
  fecha: string
  diagnostico: string
  kilometraje: number | null
  observaciones: string
  mecanico: { nombre: string } | null
}

export default function PanelCliente() {
  const { getToken } = useAuth()
  const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null)
  const [historial, setHistorial] = useState<Servicio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const token = await getToken()
      const headers = { Authorization: `Bearer ${token}` }

      const vehiclesRes = await axios.get(`${apiUrl}/vehicles`, { headers })
      const vehicles = vehiclesRes.data.vehicles ?? vehiclesRes.data

      if (Array.isArray(vehicles) && vehicles.length > 0) {
        const v = vehicles[0]
        setVehiculo({
          id: String(v.id),
          marca: v.marca ?? '',
          modelo: v.modelo ?? '',
          anio: v.anio ?? 0,
          placa: v.placa ?? '',
          kilometrajeActual: v.kilometrajeActual ?? 0,
          qrCode: v.qrCode ?? '',
        })

        const detailRes = await axios.get(`${apiUrl}/vehicles/${v.id}`, { headers })
        const interventions = detailRes.data.intervenciones ?? []
        setHistorial(
          interventions.map((i: any) => ({
            id: String(i.id),
            fecha: i.fecha ?? i.creadoEn ?? '',
            diagnostico: i.diagnostico ?? 'Servicio',
            kilometraje: i.kilometrajeEnRegistro ?? null,
            observaciones: i.observaciones ?? '',
            mecanico: i.mecanico ?? null,
          })),
        )
      }
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message ?? 'Error cargando datos del vehiculo')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const handleActualizarKilometraje = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!vehiculo) return

    const form = event.target as HTMLFormElement
    const input = form.elements.namedItem('kilometraje') as HTMLInputElement
    const kms = parseInt(input.value, 10)

    if (isNaN(kms) || kms <= vehiculo.kilometrajeActual) {
      setError(`El kilometraje debe ser mayor al registro actual (${vehiculo.kilometrajeActual.toLocaleString()} km).`)
      return
    }

    try {
      const token = await getToken()
      await axios.post(
        `${apiUrl}/interventions`,
        {
          vehiculoId: vehiculo.id,
          diagnostico: 'Actualizacion de kilometraje',
          kilometrajeEnRegistro: kms,
          observaciones: 'Actualizado por el cliente',
        },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setVehiculo(prev => prev ? { ...prev, kilometrajeActual: kms } : prev)
      input.value = ''
      setError(null)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Error actualizando kilometraje')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-neutral-600">Cargando datos del vehiculo...</p>
      </div>
    )
  }

  if (!vehiculo) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-neutral-900">No tienes vehiculos activos</p>
          <p className="mt-2 text-neutral-600">Contacta a tu taller para activar tu cuenta</p>
        </div>
      </div>
    )
  }

  const historialOrdenado = [...historial].sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
  )

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-primary text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/Logo_M3Motors.png" alt="M3Motors" className="h-7 brightness-0 invert" />
            <span className="text-sm opacity-80">Panel Cliente</span>
          </div>
          <span className="text-sm opacity-80">Estado: Activo</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="rounded-lg bg-error-light border border-error/20 px-4 py-3 text-sm text-error">{error}</div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <article className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-neutral-600">Resumen Vehiculo</p>
            <h2 className="mt-2 text-2xl font-semibold text-primary">{vehiculo.marca} {vehiculo.modelo}</h2>
            <p className="text-sm text-neutral-600">Ano {vehiculo.anio} - Placa {vehiculo.placa}</p>

            <div className="mt-4 rounded-lg bg-neutral-100 p-4">
              <p className="text-xs uppercase tracking-wider text-neutral-600">Kilometraje</p>
              <p className="mt-1 text-3xl font-semibold text-primary">{vehiculo.kilometrajeActual.toLocaleString()} km</p>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg bg-neutral-100 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-600">Marca</p>
                <p className="mt-1 font-semibold">{vehiculo.marca}</p>
              </div>
              <div className="rounded-lg bg-neutral-100 p-4">
                <p className="text-xs uppercase tracking-wider text-neutral-600">Modelo</p>
                <p className="mt-1 font-semibold">{vehiculo.modelo}</p>
              </div>
            </div>
          </article>

          <article className="rounded-lg bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-wider text-neutral-600">Actualizar Kilometraje</p>
            <h3 className="mt-2 text-xl font-semibold text-primary">Registro rapido</h3>

            <form onSubmit={handleActualizarKilometraje} className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-800">Ingrese el nuevo kilometraje</label>
                <input
                  name="kilometraje"
                  type="number"
                  min={vehiculo.kilometrajeActual + 1}
                  placeholder="Ej. 43000"
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600"
              >
                Guardar kilometraje
              </button>
            </form>
          </article>
        </section>

        <section className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-600">Historial</p>
              <h3 className="mt-2 text-2xl font-semibold text-primary">Historial cronologico de servicios</h3>
            </div>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800">
              {historialOrdenado.length} registros
            </span>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="px-4 py-3 font-semibold text-neutral-600">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Servicio</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Mecanico</th>
                  <th className="px-4 py-3 font-semibold text-neutral-600">Kilometraje</th>
                </tr>
              </thead>
              <tbody>
                {historialOrdenado.map(servicio => (
                  <tr key={servicio.id} className="border-b border-neutral-100 hover:bg-neutral-100">
                    <td className="px-4 py-3 text-xs text-neutral-600">{servicio.fecha.split('T')[0]}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{servicio.diagnostico}</td>
                    <td className="px-4 py-3 text-neutral-800">{servicio.mecanico?.nombre ?? '-'}</td>
                    <td className="px-4 py-3 text-neutral-700">{servicio.kilometraje?.toLocaleString() ?? '-'} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
