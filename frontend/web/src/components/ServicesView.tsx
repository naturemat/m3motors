import React, { useState } from 'react';
import {
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  Play,
  Check,
  RefreshCw
} from 'lucide-react';
import type { ServiceOrder, Client } from '../types';

interface ServicesViewProps {
  orders: ServiceOrder[];
  clients: Client[];
  addOrder: (order: Omit<ServiceOrder, 'id' | 'clientInitials' | 'date'>) => void;
  updateOrderStatus: (id: string, status: 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADO') => void;
}

export default function ServicesView({ orders, clients, addOrder, updateOrderStatus }: ServicesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [serviceName, setServiceName] = useState('Revisión de Motor');
  const [initialStatus, setInitialStatus] = useState<'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADO'>('EN PROGRESO');
  const [totalCost, setTotalCost] = useState('350');

  const filteredOrders = orders.filter(o => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      o.clientName.toLowerCase().includes(query) ||
      o.vehicle.toLowerCase().includes(query) ||
      o.serviceName.toLowerCase().includes(query) ||
      o.id.includes(query);
    const matchesStatus = statusFilter === 'TODOS' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalServicesCount = orders.length;
  const inProgressCount = orders.filter(o => o.status === 'EN PROGRESO').length;
  const completedCount = orders.filter(o => o.status === 'COMPLETADO').length;
  const pendingCount = orders.filter(o => o.status === 'PENDIENTE').length;

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === selectedClientId);
    if (!client) return;
    addOrder({
      clientName: client.name,
      vehicle: client.vehicleModel || 'Vehículo General',
      serviceName,
      status: initialStatus,
      total: parseFloat(totalCost) || 150,
    });
    setSelectedClientId(''); setServiceName('Revisión de Motor'); setInitialStatus('EN PROGRESO'); setTotalCost('350');
    setShowAddModal(false);
  };

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Mantenimiento y Servicios</h2>
          <span className="text-xs text-sky-200/80 font-medium">Órdenes de Trabajo Activas</span>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer">
          <Plus className="w-4 h-4" /> Nueva Orden de Trabajo
        </button>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <section className="grid grid-cols-1 sm:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Total Servicios</span>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-[#003b5a]">{totalServicesCount}</h3>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold">Historial Activo</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">En Progreso</span>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-sky-700">{inProgressCount}</h3>
              <span className="text-[10px] text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full font-bold">Atención Técnica</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Completados</span>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-green-700">{completedCount}</h3>
              <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-bold">Listos para Entrega</span>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Pendientes</span>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-amber-700">{pendingCount}</h3>
              <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold">En Espera de Filtro</span>
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Search className="w-4 h-4 text-slate-400" /></span>
            <input type="text" placeholder="Buscar servicio por auto, cliente o tipo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 text-xs rounded-lg pl-9 pr-4 py-2 transition-all outline-none border border-slate-200 focus:border-[#1a5276]" />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Filtrar por Estado:</span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-bold">
              {['TODOS', 'PENDIENTE', 'EN PROGRESO', 'COMPLETADO'].map((st) => (
                <button key={st} onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 cursor-pointer transition-all ${statusFilter === st ? 'bg-[#003b5a] text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                  {st === 'TODOS' ? 'Todos' : st === 'EN PROGRESO' ? 'En Progreso' : st === 'COMPLETADO' ? 'Completados' : 'Pendientes'}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Registro de Órdenes del Taller</h4>
            <span className="text-xs text-slate-400 font-semibold">Mostrando {filteredOrders.length} servicios</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Orden ID</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente / Propietario</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Auto Registrado</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Servicio Requerido</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Costo</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Controles de Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">No hay órdenes de servicio activas con el filtro especificado.</td></tr>
                ) : (
                  filteredOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-slate-400 font-semibold">#ORD-00{o.id}</td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-sm">{o.clientName}</td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{o.vehicle}</td>
                      <td className="px-6 py-4 text-[#1a5276] font-medium text-sm">{o.serviceName}</td>
                      <td className="px-6 py-4 font-bold text-[#003b5a] text-sm">${o.total.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          o.status === 'COMPLETADO' ? 'bg-green-50 text-green-700' : o.status === 'EN PROGRESO' ? 'bg-sky-50 text-[#004d77]' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {o.status === 'COMPLETADO' && <CheckCircle className="w-3.5 h-3.5" />}
                          {o.status === 'EN PROGRESO' && <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />}
                          {o.status === 'PENDIENTE' && <AlertTriangle className="w-3.5 h-3.5" />}
                          {o.status === 'EN PROGRESO' ? 'En Progreso' : o.status === 'COMPLETADO' ? 'Completado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {o.status === 'PENDIENTE' && (
                            <button onClick={() => updateOrderStatus(o.id, 'EN PROGRESO')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006397] font-bold text-[10px] uppercase rounded-md transition-colors cursor-pointer border border-sky-200/50">
                              <Play className="w-3 h-3 fill-current" /> Iniciar Servicio
                            </button>
                          )}
                          {o.status === 'EN PROGRESO' && (
                            <button onClick={() => updateOrderStatus(o.id, 'COMPLETADO')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 font-bold text-[10px] uppercase rounded-md transition-colors cursor-pointer border border-green-200/50">
                              <Check className="w-3.5 h-3.5" /> Completar Trabajo
                            </button>
                          )}
                          {o.status === 'COMPLETADO' && (
                            <button onClick={() => updateOrderStatus(o.id, 'EN PROGRESO')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 font-semibold text-[10px] uppercase rounded-md transition-colors cursor-pointer">
                              <RefreshCw className="w-3 h-3" /> Reabrir Orden
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Crear Nueva Orden de Servicio</h3>
            <p className="text-slate-500 text-xs mb-5">Ingresa los detalles para registrar un nuevo servicio en el taller.</p>
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Cliente</label>
                <select required value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                  <option value="">Selecciona un cliente...</option>
                  {clients.map(c => (<option key={c.id} value={c.id}>{c.name} ({c.plate})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Servicio</label>
                <select required value={serviceName} onChange={(e) => setServiceName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
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
                  <input type="number" required min="1" placeholder="350" value={totalCost} onChange={(e) => setTotalCost(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select value={initialStatus} onChange={(e) => setInitialStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                    <option value="PENDIENTE">Pendiente</option>
                    <option value="EN PROGRESO">En Progreso</option>
                    <option value="COMPLETADO">Completado</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" disabled={!selectedClientId}
                  className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow-md transition-all cursor-pointer ${selectedClientId ? 'bg-[#003b5a] hover:bg-[#1a5276]' : 'bg-slate-300 shadow-none cursor-not-allowed'}`}>
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
