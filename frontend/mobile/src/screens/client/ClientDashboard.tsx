import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import api from '@/services/api';
import type { Vehicle, Intervention } from '@/types';

const quickActions = [
  { label: 'Mi QR', path: '/client/qr' },
  { label: 'KM', path: '/client/update-km' },
  { label: 'Historial', path: '/client/history' },
  { label: 'Perfil', path: '/client/profile' },
];

export function ClientDashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vehicles/my')
      .then((res) => {
        setVehicle(res.data);
        return api.get(`/vehicles/${res.data.id}/history`);
      })
      .then((res) => {
        setInterventions(res.data?.intervenciones?.slice(0, 5) || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
        Cargando...
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{
        background: 'var(--primary-500)', padding: '24px 16px 32px',
        borderRadius: '0 0 24px 24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{
            background: 'var(--accent)', color: 'white', fontWeight: 800,
            fontSize: 16, padding: '4px 8px', borderRadius: 6,
          }}>
            M3
          </div>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
            Mi Vehiculo
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          Bienvenido, {user?.firstName || 'Cliente'}
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {vehicle ? (
          <div style={{
            background: 'white', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              {vehicle.marca} {vehicle.modelo}
            </h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 12 }}>
              {vehicle.placa} - {vehicle.anio}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{
                background: 'var(--gray-100)', borderRadius: 8, padding: 12,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Kilometraje</p>
                <p style={{
                  fontSize: 18, fontWeight: 700, color: 'var(--primary-500)',
                }}>
                  {(vehicle.ultimoKilometraje || 0).toLocaleString()}
                </p>
              </div>
              <div style={{
                background: 'var(--gray-100)', borderRadius: 8, padding: 12,
                textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Servicios</p>
                <p style={{
                  fontSize: 18, fontWeight: 700, color: 'var(--primary-500)',
                }}>
                  {vehicle.totalIntervenciones || 0}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'white', borderRadius: 12, padding: 32, textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              No hay vehiculo registrado
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              style={{
                background: 'white', borderRadius: 10, padding: 16,
                textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: 'none',
              }}
            >
              <p style={{ fontSize: 12, fontWeight: 500 }}>{action.label}</p>
            </button>
          ))}
        </div>

        {interventions.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>
              Ultimos Servicios
            </h3>
            {interventions.map((i) => (
              <div key={i.id} style={{
                padding: '8px 0', borderBottom: '1px solid var(--gray-100)',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>
                    {i.servicio || i.diagnostico}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {new Date(i.fecha).toLocaleDateString()}
                  </p>
                </div>
                <span style={{ color: 'var(--gray-500)', fontSize: 12 }}>
                  {i.kilometraje?.toLocaleString()} km
                </span>
              </div>
            ))}
            <button
              onClick={() => navigate('/client/history')}
              style={{
                color: 'var(--primary-500)', fontSize: 13, fontWeight: 500,
                marginTop: 8, display: 'block', width: '100%', textAlign: 'center',
              }}
            >
              Ver historial completo
            </button>
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
          { label: 'Inicio', path: '/client', active: true },
          { label: 'QR', path: '/client/qr' },
          { label: 'Historial', path: '/client/history' },
          { label: 'Perfil', path: '/client/profile' },
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
