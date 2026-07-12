import React, { useState } from 'react';
import {
  UserCog,
  Plus,
  ChevronRight,
  ChevronLeft,
  Search,
  Percent,
  CheckCircle2,
  PauseCircle,
  AlertCircle
} from 'lucide-react';
import type { Mechanic } from '../types';

interface MechanicsViewProps {
  mechanics: Mechanic[];
  addMechanic: (mechanic: Omit<Mechanic, 'id' | 'idCard'>) => void;
  updateWorkload: (id: string, workload: number) => void;
  deleteMechanic: (id: string) => void;
}

export default function MechanicsView({ mechanics, addMechanic, updateWorkload, deleteMechanic }: MechanicsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('Motor y Transmisión');
  const [workload, setWorkload] = useState('50');
  const [status, setStatus] = useState<'Activo' | 'Inactivo'>('Activo');

  const [editingWorkloadId, setEditingWorkloadId] = useState<string | null>(null);
  const [tempWorkload, setTempWorkload] = useState('50');

  const filteredMechanics = mechanics.filter(m => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = m.name.toLowerCase().includes(query) || m.idCard.toLowerCase().includes(query);
    const matchesSpecialty = specialtyFilter === 'Todas' || m.specialty === specialtyFilter;
    return matchesSearch && matchesSpecialty;
  });

  const totalCount = 10 + mechanics.length;
  const activeToday = 8 + mechanics.filter(m => m.status === 'Activo').length;
  const restCount = 2 + mechanics.filter(m => m.status === 'Inactivo').length;
  const totalWorkloadSum = mechanics.reduce((sum, m) => sum + m.workload, 0);
  const averageWorkload = mechanics.length > 0 ? Math.round(totalWorkloadSum / mechanics.length) : 78;

  const handleCreateMechanic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    addMechanic({ name, specialty, workload: parseInt(workload) || 0, status });
    setName(''); setSpecialty('Motor y Transmisión'); setWorkload('50'); setStatus('Activo');
    setShowAddModal(false);
  };

  const startEditWorkload = (m: Mechanic) => {
    setEditingWorkloadId(m.id);
    setTempWorkload(m.workload.toString());
  };

  const saveWorkload = (id: string) => {
    const val = Math.min(100, Math.max(0, parseInt(tempWorkload) || 0));
    updateWorkload(id, val);
    setEditingWorkloadId(null);
  };

  const handleRemoveMechanic = (id: string, name: string) => {
    if (confirm(`¿Está seguro de que desea retirar del sistema al mecánico ${name}?`)) {
      deleteMechanic(id);
    }
  };

  const specialties = ['Todas', 'Motor y Transmisión', 'Sistemas Eléctricos', 'Frenos y Suspensión', 'Diagnóstico General', 'Alineación y Balanceo', 'Planchado y Pintura'];

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-sky-200/70 uppercase tracking-widest mb-0.5">
            <span>Gestión</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Mecánicos</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight leading-none">Equipo Técnico</h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1a5276] hover:bg-sky-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agregar Mecánico
        </button>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">Carga de Trabajo en Tiempo Real</h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              Supervisa la carga de trabajo, especialidades y disponibilidad de tu equipo de mecánicos en tiempo real.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="self-start md:self-auto shrink-0 bg-[#003b5a] hover:bg-[#1a5276] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
          >
            + Agregar Mecánico
          </button>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="p-3 bg-sky-50 text-sky-700 rounded-xl"><UserCog className="w-6 h-6" /></div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Mecánicos</p>
              <h4 className="text-2xl font-bold text-[#003b5a]">{totalCount}</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Activos Hoy</p>
              <h4 className="text-2xl font-bold text-[#003b5a]">{activeToday}</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Percent className="w-6 h-6" /></div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Carga Promedio</p>
              <h4 className="text-2xl font-bold text-[#003b5a]">{averageWorkload}%</h4>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><PauseCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">En Descanso</p>
              <h4 className="text-2xl font-bold text-[#003b5a]">{restCount}</h4>
            </div>
          </div>
        </section>

        <section className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar mecánico..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 text-xs rounded-lg pl-9 pr-4 py-2 transition-all outline-none border border-slate-200 focus:border-[#1a5276]"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">Especialidad:</span>
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="w-full sm:w-52 bg-slate-50 hover:bg-slate-100/60 focus:bg-white text-slate-800 text-xs rounded-lg px-2.5 py-1.5 transition-all outline-none border border-slate-200 focus:border-[#1a5276] cursor-pointer"
            >
              {specialties.map((spec, i) => (
                <option key={i} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">Listado de Mecánicos</h4>
            <span className="text-xs text-slate-400 font-semibold">Mostrando 1-{filteredMechanics.length} de {filteredMechanics.length} mecánicos</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/20 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre del Mecánico</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Especialidad</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Carga de Trabajo</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMechanics.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No hay mecánicos registrados que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredMechanics.map((m) => {
                    const initials = m.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    const isOverloaded = m.workload >= 80;
                    const isModerate = m.workload >= 30 && m.workload < 80;
                    const barColorClass = isOverloaded ? 'bg-red-500' : isModerate ? 'bg-[#1a5276]' : 'bg-emerald-500';

                    return (
                      <tr key={m.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">{initials}</div>
                          <div>
                            <span className="block font-bold text-slate-800 text-sm leading-tight">{m.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold tracking-wider">{m.idCard}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-sky-50 text-[#006397] text-[11px] font-bold px-2.5 py-1 rounded-md">{m.specialty}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 w-56 max-w-full">
                            {editingWorkloadId === m.id ? (
                              <div className="flex items-center gap-2 w-full">
                                <input type="number" min="0" max="100" value={tempWorkload} onChange={(e) => setTempWorkload(e.target.value)}
                                  className="w-16 bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-bold text-slate-800 focus:outline-none" />
                                <button onClick={() => saveWorkload(m.id)} className="bg-green-600 text-white rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer">OK</button>
                                <button onClick={() => setEditingWorkloadId(null)} className="bg-slate-200 text-slate-700 rounded px-2 py-0.5 text-[10px] font-bold cursor-pointer">X</button>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold mb-1">
                                  <span>{m.workload}%</span>
                                  {isOverloaded && (
                                    <span className="text-red-500 text-[9px] flex items-center gap-0.5 font-extrabold uppercase">
                                      <AlertCircle className="w-2.5 h-2.5" /> Alta carga
                                    </span>
                                  )}
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                  <div className={`h-full rounded-full transition-all duration-500 ${barColorClass}`} style={{ width: `${m.workload}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            m.status === 'Activo' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === 'Activo' ? 'bg-green-500' : 'bg-slate-400'}`} />
                            {m.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => startEditWorkload(m)} className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold px-2 py-1 rounded hover:bg-indigo-50 transition-colors cursor-pointer">Modificar Carga</button>
                            <button onClick={() => handleRemoveMechanic(m.id, m.name)} className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer">Retirar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Mostrando 1-{filteredMechanics.length} de {filteredMechanics.length}</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1 border border-slate-200 rounded text-slate-400 disabled:opacity-45 cursor-pointer" disabled><ChevronLeft className="w-4 h-4" /></button>
              <button className="px-3 py-1.5 bg-[#003b5a] text-white rounded text-xs font-bold">1</button>
              <button className="p-1 border border-slate-200 hover:bg-slate-100 rounded text-slate-600 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Registrar Nuevo Mecánico</h3>
            <p className="text-slate-500 text-xs mb-5">Agrega un nuevo miembro del equipo técnico del taller mecánico.</p>

            <form onSubmit={handleCreateMechanic} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input type="text" required placeholder="Ej: Ricardo Mendoza" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Especialidad Principal</label>
                <select value={specialty} onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                  <option value="Motor y Transmisión">Motor y Transmisión</option>
                  <option value="Sistemas Eléctricos">Sistemas Eléctricos</option>
                  <option value="Frenos y Suspensión">Frenos y Suspensión</option>
                  <option value="Diagnóstico General">Diagnóstico General</option>
                  <option value="Alineación y Balanceo">Alineación y Balanceo</option>
                  <option value="Planchado y Pintura">Planchado y Pintura</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Carga Inicial (%)</label>
                  <input type="number" min="0" max="100" placeholder="50" value={workload} onChange={(e) => setWorkload(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                    <option value="Activo">Activo (Disponible)</option>
                    <option value="Inactivo">Inactivo (En Descanso)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#003b5a] hover:bg-[#1a5276] text-white text-xs font-bold shadow-md transition-all cursor-pointer">Agregar Mecánico</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
