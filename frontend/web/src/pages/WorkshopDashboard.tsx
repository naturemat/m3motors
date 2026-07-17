import { useState, useEffect, useCallback } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Client, Mechanic, ServiceOrder, KPIs } from '../types';

import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import ClientsView from '../components/ClientsView';
import MechanicsView from '../components/MechanicsView';
import ServicesView from '../components/ServicesView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';

import { Menu } from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export default function WorkshopDashboard() {
  const { signOut, getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = await authHeaders();

      const [mechanicsRes, customersRes, servicesRes, kpisRes] = await Promise.all([
        axios.get(`${apiUrl}/admin/mechanics`, { headers }),
        axios.get(`${apiUrl}/admin/customers`, { headers }),
        axios.get(`${apiUrl}/admin/services`, { headers }),
        axios.get(`${apiUrl}/admin/kpis`, { headers }),
      ]);

      if (kpisRes.data?.kpis) {
        setKpis(kpisRes.data.kpis);
      }

      const rawMechanics: any[] = mechanicsRes.data.mechanics ?? [];
      setMechanics(
        rawMechanics.map((m) => ({
          id: String(m.id),
          idCard: `MEC-${String(m.id).padStart(3, '0')}`,
          name: m.nombre,
          specialty: m.especialidad ?? 'General',
          workload: m.rating ?? 0,
          status: m.activo ? 'Activo' : 'Inactivo',
        })),
      );

      const rawClients: any[] = customersRes.data.activeClients ?? [];
      setClients(
        rawClients.map((c) => ({
          id: String(c.id),
          idCard: `CLI-${String(c.id).padStart(4, '0')}`,
          name: c.nombre,
          email: c.email,
          phone: c.telefono,
          plate: '',
          lastService: '',
          status: c.status === 'ACTIVATED' ? 'Activo' : 'Pendiente',
          vehicleModel: '',
        })),
      );

      const rawServices: any[] = servicesRes.data.services ?? [];
      setOrders(
        rawServices.map((s) => ({
          id: String(s.id),
          clientName: '',
          clientInitials: '',
          vehicle: '',
          serviceName: s.nombre,
          status: 'PENDIENTE' as const,
          total: s.precioReferencia ?? 0,
          date: '',
        })),
      );

      setError(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error desconocido';
      console.error('[WorkshopDashboard] API error:', err);
      setError(`Error al cargar datos del API: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleResetData = () => {
    setClients([]);
    setMechanics([]);
    setOrders([]);
  };

  const handleAddOrder = (newOrder: Omit<ServiceOrder, 'id' | 'clientInitials' | 'date'>) => {
    const initials = newOrder.clientName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const order: ServiceOrder = {
      ...newOrder,
      id: String(orders.length + 1),
      clientInitials: initials,
      date: new Date().toISOString().split('T')[0],
    };

    setOrders([order, ...orders]);
  };

  const handleUpdateOrderStatus = (id: string, status: 'PENDIENTE' | 'EN PROGRESO' | 'COMPLETADO') => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const handleAddClient = (newClient: Omit<Client, 'id' | 'idCard'>) => {
    const client: Client = {
      ...newClient,
      id: String(clients.length + 1),
      idCard: `CLI-${String(942 + clients.length).padStart(4, '0')}`,
    };
    setClients([client, ...clients]);
  };

  const handleDeleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAddMechanic = async (newMechanic: Omit<Mechanic, 'id' | 'idCard'>) => {
    try {
      const headers = await authHeaders();
      await axios.post(
        `${apiUrl}/admin/mechanics`,
        { nombre: newMechanic.name, especialidad: newMechanic.specialty },
        { headers },
      );
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo agregar el mecánico');
    }
  };

  const handleUpdateWorkload = (id: string, workload: number) => {
    setMechanics((prev) => prev.map((m) => (m.id === id ? { ...m, workload } : m)));
  };

  const handleDeleteMechanic = async (id: string) => {
    try {
      const headers = await authHeaders();
      await axios.delete(`${apiUrl}/admin/mechanics/${id}`, { headers });
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'No se pudo eliminar el mecánico');
    }
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            clients={clients}
            mechanics={mechanics}
            orders={orders}
            kpis={kpis}
            addOrder={handleAddOrder}
            setActiveTab={setActiveTab}
          />
        );
      case 'clients':
        return (
          <ClientsView
            clients={clients}
            addClient={handleAddClient}
            deleteClient={handleDeleteClient}
          />
        );
      case 'mechanics':
        return (
          <MechanicsView
            mechanics={mechanics}
            addMechanic={handleAddMechanic}
            updateWorkload={handleUpdateWorkload}
            deleteMechanic={handleDeleteMechanic}
          />
        );
      case 'services':
        return (
          <ServicesView
            orders={orders}
            clients={clients}
            addOrder={handleAddOrder}
            updateOrderStatus={handleUpdateOrderStatus}
          />
        );
      case 'reports':
        return <ReportsView kpis={kpis} mechanics={mechanics} orders={orders} />;
      case 'settings':
        return <SettingsView onResetData={handleResetData} />;
      default:
        return (
          <DashboardView
            clients={clients}
            mechanics={mechanics}
            orders={orders}
            kpis={kpis}
            addOrder={handleAddOrder}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafb] flex items-center justify-center">
        <p className="text-slate-600">Cargando taller...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafb] font-sans antialiased">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        user={user}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Mobile Navbar */}
        <div className="md:hidden flex items-center justify-between px-6 py-3.5 bg-[#003b5a] text-white border-b border-[#003b5a]/10 shrink-0 sticky top-0 z-40 print:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 active:scale-95 transition-all"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-4 h-4 object-contain" />
            <span className="text-sm font-black tracking-tight uppercase">M3Motors</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#1a5276] flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.firstName?.[0] ?? 'U'}
            </span>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {error && (
            <div className="mx-6 mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {renderView()}

          <footer className="py-6 text-center border-t border-slate-100 bg-[#f2f4f5] shrink-0 mt-12 text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider print:hidden">
            © 2026 M3Motors Workshop Management System. Todos los derechos reservados.
          </footer>
        </main>
      </div>
    </div>
  );
}
