import {
  Activity,
  ArrowUpRight,
  CheckCircle,
  Award,
} from 'lucide-react';
import type { KPIs, Mechanic, ServiceOrder } from '../types';

interface ReportsViewProps {
  kpis: KPIs | null;
  mechanics: Mechanic[];
  orders: ServiceOrder[];
}

const COLORS = [
  'bg-[#003b5a]',
  'bg-sky-500',
  'bg-[#1a5276]',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-teal-500',
];

export default function ReportsView({ kpis, mechanics, orders }: ReportsViewProps) {
  const serviceCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.serviceName] = (acc[o.serviceName] || 0) + 1;
    return acc;
  }, {});

  const statsBreakdown = Object.entries(serviceCounts)
    .map(([name, count], i) => ({
      name,
      pct: orders.length > 0 ? Math.round((count / orders.length) * 100) : 0,
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Reportes de Rendimiento</h2>
          <span className="text-xs text-sky-200/80 font-medium">Estadísticas y Análisis de Productividad</span>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Ticket Promedio</span>
            <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">
              ${kpis && kpis.totalServicios > 0 ? (kpis.ingresosTotales / kpis.totalServicios).toFixed(2) : '0.00'}
            </h3>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 mt-2">
              <ArrowUpRight className="w-3.5 h-3.5" /> Ingresos mes / servicios activos
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Intervenciones del Mes</span>
            <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">{kpis?.intervencionesMes ?? orders.length}</h3>
            <span className="text-[10px] text-indigo-600 font-semibold flex items-center gap-0.5 mt-2">
              <Activity className="w-3.5 h-3.5" /> {orders.length} órdenes registradas
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Alertas Activas</span>
            <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">{kpis?.totalAlertasActivas ?? 0}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-2">
              <Award className="w-3.5 h-3.5" /> Mantenimiento predictivo
            </span>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] bg-gradient-to-br from-white to-slate-50">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Eficiencia del Taller</span>
            <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">
              {kpis && kpis.totalMecanicos > 0 ? `${kpis.totalServicios} Servicios` : '0 Servicios'}
            </h3>
            <span className="text-[10px] text-sky-700 font-semibold flex items-center gap-0.5 mt-2">
              <CheckCircle className="w-3.5 h-3.5" /> {kpis?.totalMecanicos ?? mechanics.length} mecánicos activos
            </span>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] lg:col-span-12">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h4 className="font-bold text-slate-800 text-sm">Distribución de Servicios Realizados</h4>
              <p className="text-xs text-slate-400">Proporción según el tipo de orden de trabajo solicitada por el cliente.</p>
            </div>
            {statsBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No hay datos de servicios para mostrar.</p>
            ) : (
              <div className="space-y-5">
                {statsBreakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{item.name}</span>
                      <span className="font-semibold text-slate-400">{item.pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
