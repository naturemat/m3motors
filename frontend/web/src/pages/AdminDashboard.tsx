import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { useAuth, useUser } from '@clerk/clerk-react'

type Mechanic = { id: number; nombre: string; especialidad: string | null; activo: boolean; rating?: number }
type ServiceItem = { id: number; nombre: string; descripcion?: string | null; precioReferencia: number; categoria: string }
type ActiveClient = { id: number; nombre: string; email: string; telefono: string; status: string; idMecanicoActivo: number; vehiculos?: Array<{ placa: string; marca: string; modelo: string }> }
type PreRegisteredClient = { id: number; nombre: string; email: string; telefono: string; licensePlate: string | null; status: string; fechaPreRegistro: string; fechaActivacion: string | null }
type Workshop = { id: number; nombre: string; direccion: string; horarios?: string | null; telefono: string; email: string; ownerId: string }

type Kpis = { totalVehicles: number; totalClientsActive: number; monthlyRevenue: number; avgMechanicRating: number; servicesCount: number; totalMecanicos: number; intervencionesMes: number }

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function downloadCSV(filename: string, rows: string[][]) {
  const csvContent = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function AdminDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()

  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [activeClients, setActiveClients] = useState<ActiveClient[]>([])
  const [preRegisteredClients, setPreRegisteredClients] = useState<PreRegisteredClient[]>([])
  const [workshop, setWorkshop] = useState<Workshop | null>(null)
  const [kpis, setKpis] = useState<Kpis>({ totalVehicles: 0, totalClientsActive: 0, monthlyRevenue: 0, avgMechanicRating: 0, servicesCount: 0, totalMecanicos: 0, intervencionesMes: 0 })
  const [newMechanicName, setNewMechanicName] = useState('')
  const [newServiceName, setNewServiceName] = useState('')
  const [newServicePrice, setNewServicePrice] = useState<number | ''>('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const authHeaders = useCallback(async () => {
    const token = await getToken()
    return { Authorization: `Bearer ${token}` }
  }, [getToken])

  const fetchAdminData = useCallback(async () => {
    try {
      const headers = await authHeaders()
      const [kpisRes, workshopRes, mechanicsRes, servicesRes, customersRes] = await Promise.all([
        axios.get(`${apiUrl}/admin/kpis`, { headers }),
        axios.get(`${apiUrl}/admin/workshop`, { headers }),
        axios.get(`${apiUrl}/admin/mechanics`, { headers }),
        axios.get(`${apiUrl}/admin/services`, { headers }),
        axios.get(`${apiUrl}/admin/customers`, { headers }),
      ])

      // Backend returns flat Spanish field names (gestion-visualizacion controller)
      const raw = kpisRes.data
      setKpis({
        totalVehicles: raw.totalVehiculos ?? raw.totalVehicles ?? 0,
        totalClientsActive: raw.totalClientesActivos ?? raw.totalClientsActive ?? 0,
        monthlyRevenue: raw.ingresosMes ?? raw.monthlyRevenue ?? 0,
        avgMechanicRating: raw.calificacionPromedio ?? raw.avgMechanicRating ?? 0,
        servicesCount: raw.totalServicios ?? raw.servicesCount ?? 0,
        totalMecanicos: raw.totalMecanicos ?? 0,
        intervencionesMes: raw.intervencionesMes ?? 0,
      })
      setWorkshop(workshopRes.data.workshop)
      setMechanics(mechanicsRes.data.mechanics ?? [])
      setServices(servicesRes.data.services ?? [])
      setActiveClients(customersRes.data.activeClients ?? [])
      setPreRegisteredClients(customersRes.data.preRegistered ?? [])
      setError(null)
    } catch (fetchError: any) {
      console.error(fetchError)
      setError(fetchError?.response?.data?.message ?? 'Error cargando datos administrativos')
    }
  }, [authHeaders])

  useEffect(() => {
    void fetchAdminData()
  }, [fetchAdminData])

  const addMechanic = async () => {
    if (!newMechanicName.trim()) return
    setSaving(true)
    try {
      const headers = await authHeaders()
      await axios.post(`${apiUrl}/admin/mechanics`, { nombre: newMechanicName.trim() }, { headers })
      setNewMechanicName('')
      await fetchAdminData()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo agregar el mecánico')
    } finally {
      setSaving(false)
    }
  }

  const removeMechanic = async (id: number) => {
    setSaving(true)
    try {
      const headers = await authHeaders()
      await axios.delete(`${apiUrl}/admin/mechanics/${id}`, { headers })
      await fetchAdminData()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo eliminar el mecánico')
    } finally {
      setSaving(false)
    }
  }

  const addService = async () => {
    if (!newServiceName.trim() || newServicePrice === '') return
    setSaving(true)
    try {
      const headers = await authHeaders()
      await axios.post(
        `${apiUrl}/admin/services`,
        {
          nombre: newServiceName.trim(),
          precioReferencia: Number(newServicePrice),
          categoria: 'General',
        },
        { headers },
      )
      setNewServiceName('')
      setNewServicePrice('')
      await fetchAdminData()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo agregar el servicio')
    } finally {
      setSaving(false)
    }
  }

  const activateClient = async (id: number) => {
    setSaving(true)
    try {
      const headers = await authHeaders()
      await axios.post(`${apiUrl}/admin/customers/${id}/activate`, {}, { headers })
      await fetchAdminData()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo activar el cliente')
    } finally {
      setSaving(false)
    }
  }

  const saveWorkshop = async () => {
    if (!workshop) return
    setSaving(true)
    try {
      const headers = await authHeaders()
      await axios.put(`${apiUrl}/admin/workshop`, {
        nombre: workshop.nombre,
        direccion: workshop.direccion,
        horarios: workshop.horarios,
      }, { headers })
      await fetchAdminData()
      setError(null)
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const exportAllCSV = () => {
    const rows: string[][] = []
    rows.push(['KPIs'])
    rows.push(['Total vehículos', String(kpis.totalVehicles)])
    rows.push(['Clientes activos', String(kpis.totalClientsActive)])
    rows.push(['Ingresos mes', String(kpis.monthlyRevenue)])
    rows.push(['Servicios en catálogo', String(kpis.servicesCount)])
    rows.push([])
    rows.push(['Mecánicos'])
    rows.push(['ID', 'Nombre', 'Especialidad', 'Activo'])
    mechanics.forEach(m => rows.push([String(m.id), m.nombre, m.especialidad ?? '', m.activo ? 'Sí' : 'No']))
    rows.push([])
    rows.push(['Servicios'])
    rows.push(['ID', 'Nombre', 'Precio'])
    services.forEach(s => rows.push([String(s.id), s.nombre, String(s.precioReferencia)]))
    rows.push([])
    rows.push(['Clientes activos'])
    activeClients.forEach(c => rows.push([String(c.id), c.nombre, c.email, c.telefono]))
    rows.push([])
    rows.push(['Clientes pre-registrados'])
    preRegisteredClients.forEach(c => rows.push([String(c.id), c.nombre, c.email, c.telefono, c.status]))

    downloadCSV('reporte_m3motors.csv', rows)
  }

  const printReport = () => {
    const wnd = window.open('', '_blank')
    if (!wnd) return
    wnd.document.write('<html><head><title>Reporte M3Motors</title>')
    wnd.document.write('<style>body{font-family:Inter,Arial,sans-serif;padding:20px;} .kpi{margin-bottom:8px}</style>')
    wnd.document.write('</head><body>')
    wnd.document.write(`<h1>${workshop?.nombre ?? 'Taller M3'} - Reporte mensual</h1>`)
    wnd.document.write(`<div class="kpi">Total vehículos: ${kpis.totalVehicles}</div>`)
    wnd.document.write(`<div class="kpi">Clientes activos: ${kpis.totalClientsActive}</div>`)
    wnd.document.write(`<div class="kpi">Ingresos mes: ${kpis.monthlyRevenue}</div>`)
    wnd.document.write('</body></html>')
    wnd.document.close()
    wnd.print()
  }

  const summaryMechanicCount = mechanics.length

  return (
    <div className="min-h-screen p-6 bg-neutralBg" style={{ backgroundColor: 'var(--color-neutral-bg)' }}>
      <header className="max-w-7xl mx-auto mb-6 rounded-2xl bg-white p-6 shadow">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Dashboard del Dueño</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: 'var(--color-primary)' }}>Administración del Taller</h1>
            <p className="mt-2 text-sm text-slate-600">Administra mecánicos, servicios, clientes y reportes exportables.</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            Usuario: <span className="font-semibold text-slate-900">{user?.firstName ?? 'dueño'}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto space-y-6">
        {error && (
          <div className="rounded-3xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Vehículos activos</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--color-primary)' }}>{kpis.totalVehicles}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Clientes activos</p>
            <p className="mt-3 text-3xl font-semibold" style={{ color: 'var(--color-secondary)' }}>{kpis.totalClientsActive}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ingresos del mes</p>
            <p className="mt-3 text-3xl font-semibold text-emerald-700">${kpis.monthlyRevenue}</p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Calif. promedio</p>
            <p className="mt-3 text-3xl font-semibold">{kpis.avgMechanicRating}</p>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Mecánicos</p>
                <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>Gestión de mecánicos</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{summaryMechanicCount} registrados</span>
            </div>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row">
              <input value={newMechanicName} onChange={e => setNewMechanicName(e.target.value)} placeholder="Nombre del mecánico" className="flex-1 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white" />
              <button disabled={saving} onClick={addMechanic} className="rounded-3xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">Agregar</button>
            </div>

            <div className="space-y-3">
              {mechanics.map(mechanic => (
                <div key={mechanic.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{mechanic.nombre}</p>
                    <p className="text-sm text-slate-600">{mechanic.especialidad ?? 'General'}</p>
                  </div>
                  <button disabled={saving} onClick={() => void removeMechanic(mechanic.id)} className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60">Eliminar</button>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Servicios</p>
              <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>Catálogo de servicios</h2>
            </div>

            <div className="mb-4 space-y-3">
              <input value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Servicio" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white" />
              <input value={newServicePrice === '' ? '' : String(newServicePrice)} onChange={e => setNewServicePrice(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Precio" className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white" />
              <button disabled={saving} onClick={addService} className="w-full rounded-3xl bg-secondary px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">Agregar servicio</button>
            </div>

            <div className="space-y-2">
              {services.map(service => (
                <div key={service.id} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{service.nombre}</p>
                      <p className="text-sm text-slate-600">{service.categoria}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">${service.precioReferencia}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Clientes</p>
                <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>Activos y pre-registrados</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{activeClients.length} activos</span>
            </div>

            <div className="space-y-3">
              {activeClients.map(client => (
                <div key={client.id} className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div>
                    <p className="font-semibold text-slate-900">{client.nombre}</p>
                    <p className="text-sm text-slate-600">{client.email}</p>
                    {client.vehiculos && client.vehiculos.length > 0 && (
                      <p className="text-xs text-slate-500 mt-1">
                        {client.vehiculos.map(v => `${v.marca} ${v.modelo} (${v.placa})`).join(', ')}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">Activo</span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-sm uppercase tracking-[0.28em] text-slate-500">Pre-registrados</p>
              <div className="mt-3 space-y-3">
                {preRegisteredClients.map(client => (
                  <div key={client.id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{client.nombre}</p>
                      <p className="text-sm text-slate-600">{client.email}</p>
                      <p className="text-sm text-slate-500">Estado: {client.status}</p>
                    </div>
                    <button disabled={saving} onClick={() => void activateClient(client.id)} className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60">Activar</button>
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Configuración del taller</p>
              <h2 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--color-primary)' }}>Datos del taller</h2>
            </div>

            <div className="space-y-4">
              <input
                value={workshop?.nombre ?? ''}
                onChange={e => setWorkshop(prev => prev ? { ...prev, nombre: e.target.value } : prev)}
                placeholder="Nombre del taller"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
              />
              <input
                value={workshop?.direccion ?? ''}
                onChange={e => setWorkshop(prev => prev ? { ...prev, direccion: e.target.value } : prev)}
                placeholder="Dirección"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
              />
              <input
                value={workshop?.horarios ?? ''}
                onChange={e => setWorkshop(prev => prev ? { ...prev, horarios: e.target.value } : prev)}
                placeholder="Horario de atención"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-primary focus:bg-white"
              />
              <button disabled={saving || !workshop} onClick={saveWorkshop} className="w-full rounded-3xl bg-secondary px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">Guardar configuración</button>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Reporte mensual</p>
              <div className="mt-4 flex gap-2">
                <button onClick={exportAllCSV} className="flex-1 rounded-3xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700">Exportar CSV</button>
                <button onClick={printReport} className="flex-1 rounded-3xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">Imprimir / PDF</button>
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
