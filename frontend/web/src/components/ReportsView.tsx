import { useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  FileDown,
  Loader2,
  CheckCircle,
  Award,
  Clock
} from 'lucide-react';
import type { KPIs, Client, Mechanic, ServiceOrder } from '../types';

interface ReportsViewProps {
  kpis: KPIs | null;
  clients: Client[];
  mechanics: Mechanic[];
  orders: ServiceOrder[];
}

export default function ReportsView({ kpis, clients: _clients, mechanics, orders }: ReportsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const statsBreakdown = [
    { name: 'Reparaciones de Motor', pct: 45, color: 'bg-[#003b5a]' },
    { name: 'Cambio de Aceite & Filtros', pct: 20, color: 'bg-sky-500' },
    { name: 'Frenos & Suspensión', pct: 20, color: 'bg-[#1a5276]' },
    { name: 'Diagnósticos Electrónicos', pct: 15, color: 'bg-emerald-500' },
  ];

  const handleDownloadPDF = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGenerating(false);
            window.print();
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 80);
  };

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Reportes de Rendimiento</h2>
          <span className="text-xs text-sky-200/80 font-medium">Estadísticas y Análisis de Productividad</span>
        </div>
        <button onClick={handleDownloadPDF}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
          <FileDown className="w-4 h-4" /> Exportar PDF
        </button>
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
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] lg:col-span-7">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h4 className="font-bold text-slate-800 text-sm">Distribución de Servicios Realizados</h4>
              <p className="text-xs text-slate-400">Proporción según el tipo de orden de trabajo solicitada por el cliente.</p>
            </div>
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
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] lg:col-span-5 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h4 className="font-bold text-slate-800 text-sm">Horas de Mayor Demanda</h4>
                <p className="text-xs text-slate-400">Identifica los bloques horarios críticos para asignar personal de repuesto.</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-red-50 text-red-800 rounded-lg">
                  <Clock className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-red-700">Pico Crítico (Mañana)</span>
                    <span className="text-xs font-semibold">10:00 AM - 12:30 PM (Bloque de Recepción)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-amber-50 text-amber-800 rounded-lg">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-amber-700">Pico Moderado (Tarde)</span>
                    <span className="text-xs font-semibold">03:30 PM - 05:30 PM (Bloque de Entregas)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-100 mt-6 text-[11px] text-slate-400 text-center font-semibold">
              Datos consolidados en base a {orders.length} órdenes procesadas.
            </div>
          </div>
        </section>
      </div>

      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border border-slate-100 text-center space-y-4">
            <div className="relative w-16 h-16 mx-auto flex items-center justify-center bg-rose-50 text-rose-600 rounded-full">
              <Loader2 className="w-8 h-8 animate-spin" />
              <FileDown className="w-4 h-4 absolute" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Generando Reporte PDF</h4>
              <p className="text-xs text-slate-400">Compilando estadísticas de rendimiento y tiempos de entrega...</p>
            </div>
            <div className="space-y-1.5">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-600 h-full rounded-full transition-all duration-150" style={{ width: `${generationProgress}%` }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Estado: Preparando documento</span>
                <span>{generationProgress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
