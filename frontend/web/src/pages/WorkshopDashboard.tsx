import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import type { Client, Mechanic, ServiceOrder } from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_MECHANICS,
  INITIAL_ORDERS
} from '../data';

import Sidebar from '../components/Sidebar';
import DashboardView from '../components/DashboardView';
import ClientsView from '../components/ClientsView';
import MechanicsView from '../components/MechanicsView';
import ServicesView from '../components/ServicesView';
import ReportsView from '../components/ReportsView';
import SettingsView from '../components/SettingsView';

import { Menu } from 'lucide-react';

export default function WorkshopDashboard() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('m3_active_tab') || 'dashboard';
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  const [clients, setClients] = useState<Client[]>(() => {
    const stored = localStorage.getItem('m3_clients');
    return stored ? JSON.parse(stored) : INITIAL_CLIENTS;
  });

  const [mechanics, setMechanics] = useState<Mechanic[]>(() => {
    const stored = localStorage.getItem('m3_mechanics');
    return stored ? JSON.parse(stored) : INITIAL_MECHANICS;
  });

  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    const stored = localStorage.getItem('m3_orders');
    return stored ? JSON.parse(stored) : INITIAL_ORDERS;
  });

  useEffect(() => {
    localStorage.setItem('m3_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('m3_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('m3_mechanics', JSON.stringify(mechanics));
  }, [mechanics]);

  useEffect(() => {
    localStorage.setItem('m3_orders', JSON.stringify(orders));
  }, [orders]);

  const handleLogout = async () => {
    localStorage.removeItem('m3_active_tab');
    await signOut();
    navigate('/');
  };

  const handleResetData = () => {
    setClients(INITIAL_CLIENTS);
    setMechanics(INITIAL_MECHANICS);
    setOrders(INITIAL_ORDERS);
  };

  const handleAddOrder = (newOrder: Omit<ServiceOrder, 'id' | 'clientInitials' | 'date'>) => {
    const initials = newOrder.clientName
      .split(' ')
      .map(n => n[0])
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
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
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
    setClients(prev => prev.filter(c => c.id !== id));
  };

  const handleAddMechanic = (newMechanic: Omit<Mechanic, 'id' | 'idCard'>) => {
    const m: Mechanic = {
      ...newMechanic,
      id: String(mechanics.length + 1),
      idCard: `MEC-${String(1 + mechanics.length).padStart(3, '0')}`,
    };
    setMechanics([...mechanics, m]);
  };

  const handleUpdateWorkload = (id: string, workload: number) => {
    setMechanics(prev => prev.map(m => m.id === id ? { ...m, workload } : m));
  };

  const handleDeleteMechanic = (id: string) => {
    setMechanics(prev => prev.filter(m => m.id !== id));
  };

  const renderView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            clients={clients}
            mechanics={mechanics}
            orders={orders}
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
        return <ReportsView />;
      case 'settings':
        return <SettingsView onResetData={handleResetData} />;
      default:
        return (
          <DashboardView
            clients={clients}
            mechanics={mechanics}
            orders={orders}
            addOrder={handleAddOrder}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafb] font-sans antialiased">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
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
          {renderView()}

          <footer className="py-6 text-center border-t border-slate-100 bg-[#f2f4f5] shrink-0 mt-12 text-[11px] font-semibold text-slate-400/80 uppercase tracking-wider print:hidden">
            © 2026 M3Motors Workshop Management System. Todos los derechos reservados.
          </footer>
        </main>
      </div>
    </div>
  );
}
