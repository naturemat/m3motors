import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import api from '@/services/api';
import type { Customer, DashboardData } from '@/types';

const cardLabels = ['Pendientes', 'En Proceso', 'Urgentes', 'Listos'];

export function MechanicDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats] = useState<DashboardData>({
    appointmentsToday: 0, customersInShop: 0, pendingCustomers: 0, unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/customers')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setCustomers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary-500)', padding: '24px 16px 32px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ background: 'var(--accent)', color: 'white', fontWeight: 800, fontSize: 16, padding: '4px 8px', borderRadius: 6 }}>M3</div>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>Panel del Mecanico</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          Bienvenido, {user?.firstName || 'Mecanico'}
        </p>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          {cardLabels.map((label) => (
            <div key={label} style={{
              flex: 1, background: 'white', borderRadius: 12, padding: 12,
              textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary-500)' }}>0</div>
              <div style={{ fontSize: 10, color: 'var(--gray-500)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/mechanic/qr-scanner')}
          style={{
            width: '100%', padding: 14, background: 'var(--accent)', color: 'white',
            borderRadius: 10, fontSize: 15, fontWeight: 600, marginBottom: 20, border: 'none',
          }}
        >
          Escanear Codigo QR
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Clientes Pendientes</h3>
          <button
            onClick={() => navigate('/mechanic/customers')}
            style={{ color: 'var(--primary-500)', fontSize: 13, fontWeight: 500 }}
          >
            Ver todos
          </button>
        </div>

        {loading ? (
          <p style={{ color: 'var(--gray-500)', fontSize: 14, textAlign: 'center', padding: 20 }}>
            Cargando...
          </p>
        ) : customers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--gray-500)' }}>
            <p style={{ fontSize: 14 }}>No hay clientes pendientes</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customers.slice(0, 5).map((c) => (
              <div key={c.id} style={{
                background: 'white', borderRadius: 10, padding: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</p>
                    <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                      {c.licensePlate || 'Sin placa'}
                    </p>
                  </div>
                  <span style={{
                    background: c.status === 'PENDING' ? 'var(--warning)' : 'var(--success)',
                    color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 11,
                  }}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white',
        borderTop: '1px solid var(--gray-200)', display: 'flex',
        justifyContent: 'space-around', padding: '8px 0',
        paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
      }}>
        {[
          { label: 'Inicio', path: '/mechanic', active: true },
          { label: 'QR', path: '/mechanic/qr-scanner' },
          { label: 'Clientes', path: '/mechanic/customers' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: item.active ? 'var(--primary-500)' : 'var(--gray-500)',
              fontSize: 11, padding: '4px 16px',
            }}
          >
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
