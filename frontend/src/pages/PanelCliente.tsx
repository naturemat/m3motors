import React, { useMemo, useState } from 'react'

interface Vehiculo {
  marca: string
  modelo: string
  year: number
  placa: string
  kilometrajeActual: number
}

interface Servicio {
  id: number
  fecha: string
  tipo: string
  kilometraje: number
  detalles: string
}

export default function PanelCliente() {
  const colores = {
    primary: '#1A5276',
    secondary: '#2E86C1',
    tertiary: '#3498DB',
    neutralBg: '#F4F6F7',
    textDark: '#1C2833',
  }

  const [vehiculo, setVehiculo] = useState<Vehiculo>({
    marca: 'Toyota',
    modelo: 'Corolla',
    year: 2022,
    placa: 'PBA-1234',
    kilometrajeActual: 42500,
  })

  const [historial] = useState<Servicio[]>([
    { id: 1, fecha: '2026-05-10', tipo: 'Cambio de Aceite y Filtros', kilometraje: 40000, detalles: 'Aceite 10W-30 sintético' },
    { id: 2, fecha: '2025-11-15', tipo: 'Alineación y Balanceo', kilometraje: 30000, detalles: 'Rotación de neumáticos traseros' },
    { id: 3, fecha: '2025-04-02', tipo: 'Mantenimiento General', kilometraje: 20000, detalles: 'Revisión de frenos y niveles de líquidos' },
  ])

  const [nuevoKilometraje, setNuevoKilometraje] = useState<string>('')
  const [fotoTablero, setFotoTablero] = useState<File | null>(null)
  const [errorValidacion, setErrorValidacion] = useState<string>('')
  const [mensajeExito, setMensajeExito] = useState<string>('')

  const historialOrdenado = useMemo(
    () => [...historial].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [historial],
  )

  const handleActualizarKilometraje = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorValidacion('')
    setMensajeExito('')

    const kms = parseInt(nuevoKilometraje, 10)
    if (isNaN(kms) || kms <= vehiculo.kilometrajeActual) {
      setErrorValidacion(`El kilometraje debe ser mayor al registro actual (${vehiculo.kilometrajeActual.toLocaleString()} km).`)
      return
    }

    setVehiculo(prev => ({ ...prev, kilometrajeActual: kms }))
    window.dispatchEvent(
      new CustomEvent('KilometrajeActualizado', {
        detail: {
          placa: vehiculo.placa,
          kilometraje: kms,
          timestamp: new Date().toISOString(),
        },
      }),
    )
    setMensajeExito('¡Kilometraje actualizado correctamente!')
    setNuevoKilometraje('')
    setFotoTablero(null)
  }

  const handleFotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFotoTablero(event.target.files?.[0] ?? null)
  }

  return (
    <div className="min-h-screen p-6 bg-slate-50 text-slate-900 font-sans antialiased" style={{ backgroundColor: colores.neutralBg, color: colores.textDark }}>
      <header className="max-w-6xl mx-auto mb-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/60 backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Cliente Activado</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight" style={{ color: colores.primary }}>Panel Cliente</h1>
            <p className="mt-2 text-sm text-slate-600">Accede a tu vehículo, historial y alertas predictivas en un solo lugar.</p>
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
            Estado: <span className="font-semibold text-slate-900">Activo</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Resumen Vehículo</p>
                <h2 className="mt-2 text-2xl font-semibold" style={{ color: colores.primary }}>{vehiculo.marca} {vehiculo.modelo}</h2>
                <p className="text-sm text-slate-600">Año {vehiculo.year} · Placa {vehiculo.placa}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 px-4 py-3 text-slate-700 shadow-inner">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Kilometraje</p>
                <p className="mt-1 text-3xl font-semibold" style={{ color: colores.secondary }}>{vehiculo.kilometrajeActual.toLocaleString()} km</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Marca</p>
                <p className="mt-2 font-semibold">{vehiculo.marca}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Modelo</p>
                <p className="mt-2 font-semibold">{vehiculo.modelo}</p>
              </div>
            </div>
          </article>

          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">QR del Vehículo</p>
                <p className="mt-2 text-sm text-slate-600">Escanea o comparte este código para identificar tu auto.</p>
              </div>
              <div className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">M3-QR</div>
            </div>

            <div className="mt-6 flex items-center justify-center rounded-3xl bg-slate-100 p-6">
              <div className="relative grid h-40 w-40 grid-cols-6 gap-1 rounded-3xl bg-white p-3 shadow-sm">
                {Array.from({ length: 36 }).map((_, index) => (
                  <div
                    key={index}
                    className={
                      index % 5 === 0 || index % 7 === 0 || index % 11 === 0
                        ? 'rounded-sm bg-slate-900'
                        : 'rounded-sm bg-slate-300'
                    }
                  />
                ))}
              </div>
            </div>

            <p className="mt-4 text-center text-sm font-medium text-slate-600">Placa: <span className="font-semibold text-slate-900">{vehiculo.placa}</span></p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Actualizar Kilometraje</p>
                <h3 className="mt-2 text-xl font-semibold" style={{ color: colores.primary }}>Registro rápido</h3>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Evento: KilometrajeActualizado</span>
            </div>

            <form onSubmit={handleActualizarKilometraje} className="mt-6 space-y-4 text-sm">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Ingrese el nuevo kilometraje</label>
                <input
                  type="number"
                  min={vehiculo.kilometrajeActual + 1}
                  value={nuevoKilometraje}
                  onChange={event => setNuevoKilometraje(event.target.value)}
                  placeholder="Ej. 43000"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                />
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-slate-700">Foto del tablero (opcional)</p>
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500 transition hover:border-slate-400 hover:bg-slate-100">
                  <span>Seleccionar imagen</span>
                  <span className="mt-1 text-xs text-slate-400">PNG, JPG o JPEG</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleFotoChange} />
                </label>
                {fotoTablero && <p className="mt-3 text-sm text-emerald-700">✓ {fotoTablero.name} seleccionado</p>}
              </div>

              {errorValidacion && <div className="rounded-3xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 border border-rose-100">{errorValidacion}</div>}
              {mensajeExito && <div className="rounded-3xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 border border-emerald-100">{mensajeExito}</div>}

              <button
                type="submit"
                className="w-full rounded-3xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Guardar y notificar kilometraje
              </button>
            </form>
          </article>

          <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Alertas predictivas</p>
            <h3 className="mt-3 text-xl font-semibold" style={{ color: colores.primary }}>Mantenimiento sugerido</h3>
            <div className="mt-4 space-y-4">
              {vehiculo.kilometrajeActual >= 40000 ? (
                <div className="rounded-3xl bg-amber-50 p-4 text-sm text-amber-900 shadow-sm border border-amber-100">
                  <p className="font-semibold">Mantenimiento cercano</p>
                  <p className="mt-1 text-sm text-slate-700">Tu auto está a punto de llegar a 45,000 km. Revisa frenos y suspensión.</p>
                </div>
              ) : (
                <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-700 shadow-sm border border-slate-100">
                  <p className="font-semibold">Estado saludable</p>
                  <p className="mt-1 text-sm">Continúa con el mantenimiento preventivo según el plan.</p>
                </div>
              )}

              <div className="rounded-3xl bg-slate-50 p-4 text-sm border border-slate-200">
                <p className="font-semibold" style={{ color: colores.primary }}>Próximo servicio recomendado</p>
                <p className="mt-1 text-slate-600">45,000 km o Noviembre 2026</p>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4 text-sm border border-slate-200">
                <p className="font-semibold uppercase tracking-[0.2em] text-slate-500">Recomendaciones</p>
                <ul className="mt-2 space-y-2 text-slate-600">
                  <li>• Calibración periódica de neumáticos.</li>
                  <li>• Revisión de niveles de aceite y fluidos.</li>
                  <li>• Inspección de frenos cada 5,000 km.</li>
                </ul>
              </div>
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Historial</p>
              <h3 className="mt-2 text-2xl font-semibold" style={{ color: colores.primary }}>Historial cronológico de servicios</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">{historialOrdenado.length} registros</span>
          </div>

          <div className="mt-6 overflow-x-auto rounded-3xl border border-slate-200">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-500">Fecha</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Servicio</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Kilometraje</th>
                  <th className="px-4 py-3 font-semibold text-slate-500">Detalles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {historialOrdenado.map(servicio => (
                  <tr key={servicio.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4 font-mono text-xs text-slate-500">{servicio.fecha}</td>
                    <td className="px-4 py-4 font-semibold" style={{ color: colores.primary }}>{servicio.tipo}</td>
                    <td className="px-4 py-4 text-slate-700">{servicio.kilometraje.toLocaleString()} km</td>
                    <td className="px-4 py-4 text-sm text-slate-600">{servicio.detalles}</td>
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
