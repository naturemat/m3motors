import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import type { Intervention } from '@/types';

export function ClientHistory() {
  const navigate = useNavigate();
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/vehicles/my')
      .then((res) => api.get(`/vehicles/${res.data.id}/history`))
      .then((res) => setInterventions(res.data?.intervenciones || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--primary-500)', padding: '20px 16px' }}>
        <button
          onClick={() => navigate('/client')}
          style={{ color: 'white', fontSize: 14, marginBottom: 8 }}
        >
          {'< '}Volver
        </button>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
          Historial de Servicios
        </h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 32 }}>
            Cargando...
          </p>
        ) : interventions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--gray-500)' }}>
            <p style={{ fontSize: 14 }}>No hay servicios registrados</p>
          </div>
        ) : (
          interventions.map((i) => (
            <div key={i.id} style={{
              background: 'white', borderRadius: 10, padding: 14,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', marginBottom: 6,
              }}>
                <p style={{ fontWeight: 600, fontSize: 14 }}>
                  {i.servicio || i.diagnostico}
                </p>
                <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                  {new Date(i.fecha).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                {i.mecanico} - {i.kilometraje.toLocaleString()} km
              </p>
              {i.costo > 0 && (
                <p style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--primary-500)',
                  marginTop: 4,
                }}>
                  ${i.costo.toLocaleString()}
                </p>
              )}
              {i.componentes?.length > 0 && (
                <div style={{
                  display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6,
                }}>
                  {i.componentes.map((c, idx) => (
                    <span key={idx} style={{
                      background: 'var(--gray-100)', padding: '2px 8px',
                      borderRadius: 4, fontSize: 11,
                    }}>
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
