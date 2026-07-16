import React, { useState } from 'react';
import {
  Users,
  Car,
  Wrench,
  DollarSign,
  Plus,
  Search,
  Bell,
  ArrowUpRight,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import type { Client, Mechanic, ServiceOrder, KPIs } from '../types';

interface DashboardViewProps {
  clients: Client[];
  mechanics: Mechanic[];
  orders: ServiceOrder[];
  kpis: KPIs | null;
  addOrder: (order: Omit<ServiceOrder, 'id' | 'clientInitials' | 'date'>) => void;
  setActiveTab: (tab: string) => void;
}

export default function DashboardView({ clients, mechanics: _mechanics, orders, kpis, addOrder, setActiveTab }: DashboardViewProps) {
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceName, setServiceName] = useState('Revisión de Motor');
  const [status, setStatus] = useState<'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADO'>('EN PROGRESO');
  const [totalCost, setTotalCost] = useState('350');
  const [searchQuery, setSearchQuery] = useState('');

  const totalClients = kpis?.totalClientesActivos ?? clients.length;
  const activeVehicles = kpis?.totalVehiculos ?? clients.filter(c => c.status === 'Activo').length;
  const monthInterventions = kpis?.intervencionesMes ?? orders.length;
  const totalIncome = kpis?.ingresosMes ?? orders.reduce((sum, o) => sum + o.total, 0);

  const filteredOrders = orders.filter(order => {
    const q = searchQuery.toLowerCase();
    return (
      order.clientName.toLowerCase().includes(q) ||
      order.vehicle.toLowerCase().includes(q) ||
      order.serviceName.toLowerCase().includes(q)
    );
  });

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;

    addOrder({
      clientName: client.name,
      vehicle: client.vehicleModel || 'Vehículo General',
      serviceName,
      status,
      total: parseFloat(totalCost) || 150,
    });

    setSelectedClientId('');
    setServiceName('Revisión de Motor');
    setStatus('EN PROGRESO');
    setTotalCost('350');
    setShowNewOrderModal(false);
  };

  const incomeMonths = (() => {
    const current = totalIncome;
    const placeholder = [
      { month: 'Ene', amount: Math.round(current * 0.7), pct: 40 },
      { month: 'Feb', amount: Math.round(current * 0.8), pct: 55 },
      { month: 'Mar', amount: Math.round(current * 0.75), pct: 45 },
      { month: 'Abr', amount: Math.round(current * 0.92), pct: 70 },
      { month: 'May', amount: Math.round(current * 0.95), pct: 85 },
    ];
    return [
      ...placeholder.map((p) => ({
        month: p.month,
        amount: `$${(p.amount / 1000).toFixed(1)}K`,
        pct: `${p.pct}%`,
        isHighlight: false,
      })),
      {
        month: 'Jun',
        amount: `$${(current / 1000).toFixed(1)}K`,
        pct: '95%',
        isHighlight: true,
      },
    ];
  })();

  const points = (() => {
    const current = totalClients;
    const vals = [
      Math.round(current * 0.78),
      Math.round(current * 0.83),
      Math.round(current * 0.88),
      Math.round(current * 0.92),
      Math.round(current * 0.97),
      current,
    ];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
    const xs = [30, 110, 190, 270, 350, 430];
    const ys = vals.map((v) => Math.round(200 - ((v / (current || 1)) * 170)));
    return xs.map((x, i) => ({ x, y: ys[i], count: vals[i].toString(), month: months[i] }));
  })();

  const svgPath = `M ${points.map(p => `${p.x} ${p.y}`).join(' L ')}`;

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center gap-4">
          <div className="relative max-w-xs hidden sm:block">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-300" />
            </span>
            <input
              type="text"
              placeholder="Buscar en actividad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder-white/60 text-sm rounded-lg pl-9 pr-4 py-2 w-56 transition-all duration-200 outline-none border border-transparent focus:border-sky-400"
            />
          </div>
          <div className="relative cursor-pointer hover:bg-white/10 p-2 rounded-full transition-colors">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            onClick={() => setActiveTab('clients')}
            className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg hover:border-sky-200 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-sky-50 text-[#006397] rounded-lg group-hover:bg-sky-100 transition-colors">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +12%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Clientes</p>
              <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">{totalClients.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-indigo-50 text-[#1a5276] rounded-lg">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full">
                Estable
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Vehículos Activos</p>
              <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">{activeVehicles}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-teal-50 text-[#00527e] rounded-lg">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +5%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Intervenciones del Mes</p>
              <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">{monthInterventions}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-[#f2f4f5]">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> +24%
              </span>
            </div>
            <div>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Ingresos Totales</p>
              <h3 className="text-3xl font-extrabold text-[#003b5a] tracking-tight">
                ${totalIncome.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#003b5a]" />
                Ingresos Mensuales
              </h4>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2.5 h-2.5 bg-[#003b5a] rounded-full" />
                <span className="text-slate-500 font-semibold">Real</span>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-3 px-2 border-b border-slate-200">
              {incomeMonths.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center group relative cursor-pointer">
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 bg-[#003b5a] text-white text-[11px] font-bold px-2 py-1 rounded shadow-lg transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    {item.amount}
                  </div>
                  <div
                    className={`w-full rounded-t transition-all duration-700 ease-out ${
                      item.isHighlight
                        ? 'bg-gradient-to-t from-[#003b5a] to-[#1a5276] shadow-md shadow-[#003b5a]/10'
                        : 'bg-slate-200 hover:bg-slate-300'
                    }`}
                    style={{ height: item.pct }}
                  />
                  <span className={`text-[11px] font-semibold mt-2.5 ${item.isHighlight ? 'text-[#003b5a] font-bold' : 'text-slate-400'}`}>
                    {item.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-[#003b5a]" />
                Evolución de Clientes
              </h4>
              <select className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded px-2 py-1 text-slate-500 hover:border-slate-300 outline-none cursor-pointer">
                <option>Últimos 6 meses</option>
                <option>Año completo</option>
              </select>
            </div>

            <div className="relative h-64 border-b border-l border-slate-200/50">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 460 210" preserveAspectRatio="none">
                <line x1="0" y1="190" x2="460" y2="190" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="130" x2="460" y2="130" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="90" x2="460" y2="90" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="40" x2="460" y2="40" stroke="#f1f5f9" strokeWidth="1" />

                <path
                  d={`${svgPath} L 430 210 L 30 210 Z`}
                  fill="url(#gradient-blue)"
                  opacity="0.1"
                />

                <path
                  d={svgPath}
                  fill="none"
                  stroke="#003b5a"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <defs>
                  <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#003b5a" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>

                {points.map((point, idx) => (
                  <g key={idx} className="group/node cursor-pointer">
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="5"
                      fill="#ffffff"
                      stroke="#003b5a"
                      strokeWidth="3"
                      className="transition-all duration-200 hover:r-7"
                    />
                    <foreignObject
                      x={point.x - 35}
                      y={point.y - 35}
                      width="70"
                      height="26"
                      className="opacity-0 group-hover/node:opacity-100 transition-opacity duration-200 pointer-events-none"
                    >
                      <div className="bg-[#003b5a] text-white text-[10px] font-bold text-center py-0.5 rounded shadow">
                        {point.count}
                      </div>
                    </foreignObject>
                  </g>
                ))}
              </svg>

              <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-3 text-[11px] font-semibold text-slate-400 pointer-events-none">
                {points.map((p, idx) => (
                  <span key={idx}>{p.month}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 bg-[#f2f4f5] border-b border-slate-200/60 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Actividad Reciente</h4>
            <button
              onClick={() => setActiveTab('services')}
              className="text-[#006397] font-semibold text-xs hover:underline cursor-pointer flex items-center gap-1"
            >
              Ver todo <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehículo</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Servicio</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm">
                      No se encontraron órdenes de servicio.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const initials = order.clientInitials || order.clientName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <span className="font-medium text-slate-800 text-sm">{order.clientName}</span>
                        </td>
                        <td className="px-6 py-4 font-normal text-slate-600 text-sm">{order.vehicle}</td>
                        <td className="px-6 py-4 font-normal text-slate-600 text-sm">{order.serviceName}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'COMPLETADO'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'EN PROGRESO'
                              ? 'bg-sky-100 text-[#004d77]'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.status === 'COMPLETADO' && <CheckCircle className="w-3 h-3" />}
                            {order.status === 'EN PROGRESO' && <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '3s' }} />}
                            {order.status === 'PENDIENTE' && <AlertTriangle className="w-3 h-3" />}
                            {order.status === 'EN PROGRESO' ? 'En Progreso' : order.status === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-[#003b5a] text-sm text-right">
                          ${order.total.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <button
        onClick={() => setShowNewOrderModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#003b5a] hover:bg-[#1a5276] text-white rounded-xl shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 group z-40 cursor-pointer"
      >
        <Plus className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        <div className="absolute right-full mr-4 bg-[#003b5a] text-white px-3 py-1.5 rounded-lg shadow-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
          Nueva Orden
        </div>
      </button>

      {showNewOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowNewOrderModal(false)}
          />
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Crear Nueva Orden de Servicio</h3>
            <p className="text-slate-500 text-xs mb-5">Ingresa los detalles para registrar un nuevo servicio en el taller.</p>

            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</label>
                <select
                  required
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">Selecciona un cliente...</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.plate})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Servicio</label>
                <select
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer"
                >
                  <option value="Revisión de Motor">Revisión de Motor</option>
                  <option value="Cambio de Aceite">Cambio de Aceite</option>
                  <option value="Frenos y Suspensión">Frenos y Suspensión</option>
                  <option value="Diagnóstico Electrónico">Diagnóstico Electrónico</option>
                  <option value="Alineación y Balanceo">Alineación y Balanceo</option>
                  <option value="Servicio General Express">Servicio General Express</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Costo Total ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="350"
                    value={totalCost}
                    onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN PROGRESO">En Progreso</option>
                    <option value="COMPLETADO">Completado</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!selectedClientId}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow-md transition-all cursor-pointer ${
                    selectedClientId
                      ? 'bg-[#003b5a] hover:bg-[#1a5276]'
                      : 'bg-slate-300 shadow-none cursor-not-allowed'
                  }`}
                >
                  Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
