import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  Car,
  TrendingUp,
  Award
} from 'lucide-react';
import type { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'idCard'>) => void;
  deleteClient: (id: string) => void;
}

export default function ClientsView({ clients, addClient, deleteClient }: ClientsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [status, setStatus] = useState<'Activo' | 'Pendiente'>('Activo');

  const totalCount = 1278 + clients.length;
  const activeThisMonth = 936 + clients.filter(c => c.status === 'Activo').length;
  const pendingReviews = 15 + clients.filter(c => c.status === 'Pendiente').length;
  const retentionRate = 87.4;

  const filteredClients = clients.filter(client => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(query) ||
      client.plate.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.idCard.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === 'todos' ||
      client.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !plate) return;
    addClient({
      name,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@email.com`,
      phone: phone || '+34 600 000 000',
      plate: plate.toUpperCase(),
      lastService: 'Hoy',
      status,
      vehicleModel: vehicleModel || 'Vehículo Genérico',
    });
    setName(''); setEmail(''); setPhone(''); setPlate(''); setVehicleModel(''); setStatus('Activo');
    setShowAddModal(false);
  };

  const handleExport = () => {
    alert('¡Listado de clientes exportado exitosamente a formato CSV/Excel!');
  };

  const handleRemoveClient = (id: string, name: string) => {
    if (confirm(`¿Está seguro de que desea eliminar al cliente ${name}?`)) {
      deleteClient(id);
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Gestión de Clientes</h2>
          <span className="text-xs text-sky-200/80 font-medium">Panel Maestro de Control</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nuevo Cliente
          </button>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-7xl mx-auto">
        <section className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
          <div className="w-full md:max-w-xs flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buscar cliente</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400" />
              </span>
              <input
                type="text"
                placeholder="Nombre, placa o teléfono..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-sm rounded-lg pl-9 pr-4 py-2.5 transition-all outline-none border border-slate-200 focus:border-[#1a5276]"
              />
            </div>
          </div>

          <div className="w-full md:max-w-xs flex flex-col gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por Estado</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 text-sm rounded-lg px-3 py-2.5 transition-all outline-none border border-slate-200 focus:border-[#1a5276] cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#003b5a] hover:bg-[#1a5276] text-white rounded-lg text-sm font-bold shadow transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Nuevo Cliente
            </button>
            <button
              onClick={handleExport}
              className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-100 hover:bg-sky-200 text-[#006397] rounded-lg text-sm font-bold transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Listado Maestro de Clientes</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
              <span>Mostrando 1-{filteredClients.length} de {filteredClients.length}</span>
              <div className="flex items-center gap-1 ml-2">
                <button className="p-1 hover:bg-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer" disabled>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1 hover:bg-slate-200 rounded text-slate-400 disabled:opacity-40 cursor-pointer" disabled>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Teléfono</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Placa</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Vehículo</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Último Servicio</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm">
                      No se encontraron clientes registrados que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const initials = client.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                    return (
                      <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {initials}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 text-sm leading-tight">{client.name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{client.idCard}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-600 text-sm">{client.phone}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block bg-slate-100 text-slate-700 font-mono text-xs px-2.5 py-1 rounded border border-slate-200/80 uppercase font-semibold">
                            {client.plate}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-normal text-slate-600 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Car className="w-3.5 h-3.5 text-[#1a5276]" />
                            {client.vehicleModel}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-normal text-slate-500 text-xs">{client.lastService}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            client.status === 'Activo'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${client.status === 'Activo' ? 'bg-green-500' : 'bg-amber-500'}`} />
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleRemoveClient(client.id, client.name)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Total Clientes</span>
              <Users className="w-4 h-4 text-[#006397]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#003b5a]">{totalCount.toLocaleString()}</h3>
              <p className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 mt-1">
                <TrendingUp className="w-3 h-3" /> +12% respecto al mes anterior
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Activos este Mes</span>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#003b5a]">{activeThisMonth}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Clientes que han visitado el taller</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Revisiones Pendientes</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#003b5a]">{pendingReviews}</h3>
              <p className="text-[10px] text-slate-400 font-medium mt-1">Órdenes en espera o diagnóstico</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between bg-gradient-to-br from-white to-slate-50">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Tasa de Retención</span>
              <Award className="w-4 h-4 text-[#003b5a]" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#003b5a]">{retentionRate}%</h3>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                <div className="bg-[#003b5a] h-full rounded-full" style={{ width: `${retentionRate}%` }} />
              </div>
            </div>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="bg-white rounded-xl w-full max-w-md p-6 relative z-10 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Registrar Nuevo Cliente</h3>
            <p className="text-slate-500 text-xs mb-5">Ingresa los datos personales y del vehículo del nuevo cliente.</p>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre Completo</label>
                <input type="text" required placeholder="Ricardo Martínez" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="ricardo@email.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Teléfono</label>
                  <input type="text" placeholder="+34 612 345 678" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Placa (Matrícula)</label>
                  <input type="text" required placeholder="ABC-1234" value={plate} onChange={(e) => setPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all uppercase" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Modelo de Vehículo</label>
                  <input type="text" placeholder="BMW M3 2022" value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Estado Inicial</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input type="radio" name="status" value="Activo" checked={status === 'Activo'} onChange={() => setStatus('Activo')} className="text-[#003b5a] focus:ring-[#003b5a]" />
                    Activo (Cliente recurrente)
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                    <input type="radio" name="status" value="Pendiente" checked={status === 'Pendiente'} onChange={() => setStatus('Pendiente')} className="text-[#003b5a] focus:ring-[#003b5a]" />
                    Pendiente (Ingreso programado)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer">Cancelar</button>
                <button type="submit" className="px-4 py-2 rounded-lg bg-[#003b5a] hover:bg-[#1a5276] text-white text-xs font-bold shadow-md transition-all cursor-pointer">Registrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
