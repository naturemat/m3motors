import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchHistorialByVehicleId } from '@/services/vehicle';
import type { VehiculoHistorialData } from '@/services/vehicle';

const statusColors: Record<string, string> = {
  OPTIMO: 'var(--success)',
  ATENCION: 'var(--warning)',
  CRITICO: 'var(--error)',
};

export function VehicleHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<VehiculoHistorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchHistorialByVehicleId(id)
      .then(setData)
      .catch(() => setError('Error al cargar historial'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--error)' }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary-500)', padding: '20px 16px' }}>
        <button
          onClick={() => navigate('/mechanic')}
          style={{ color: 'white', fontSize: 14, marginBottom: 8 }}
        >
          {'< '}Volver
        </button>
        <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700 }}>
          {data.marca} {data.modelo}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
          {data.placa} - {data.anio}
        </p>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{
          background: 'white', borderRadius: 12, padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Kilometraje</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>
                {data.ultimoKilometraje?.toLocaleString() || 'N/A'} km
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Tasa de Desgaste</p>
              <p style={{ fontSize: 16, fontWeight: 700 }}>
                {data.tasaDesgaste || 'N/A'} km/sem
              </p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>Estado</p>
              <span style={{
                color: statusColors[data.estadoAlerta] || 'var(--gray-700)',
                fontWeight: 600, fontSize: 14,
              }}>
                {data.estadoAlerta}
              </span>
            </div>
          </div>
        </div>

        {data.cliente && (
          <div style={{
            background: 'white', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>
              CLIENTE
            </p>
            <p style={{ fontWeight: 600, fontSize: 15 }}>{data.cliente.nombre}</p>
            <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>
              {data.cliente.telefono} - {data.cliente.email}
            </p>
          </div>
        )}

        {data.componentesCriticos?.length > 0 && (
          <div style={{
            background: 'white', borderRadius: 12, padding: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>
              COMPONENTES CRITICOS
            </p>
            {data.componentesCriticos.map((c) => (
              <div key={c.id} style={{ marginBottom: 8 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', marginBottom: 4,
                }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{c.componente}</span>
                  <span style={{
                    fontSize: 11, color: statusColors[c.estado] || 'var(--gray-500)',
                    fontWeight: 600,
                  }}>
                    {c.desgaste}%
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', borderRadius: 3,
                    background: c.estado === 'CRITICO'
                      ? 'var(--error)'
                      : c.estado === 'ATENCION'
                        ? 'var(--warning)'
                        : 'var(--success)',
                    width: `${Math.min(c.desgaste, 100)}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{
          background: 'white', borderRadius: 12, padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 11, color: 'var(--gray-500)', marginBottom: 8 }}>
            INTERVENCIONES
          </p>
          {data.intervenciones?.length === 0 ? (
            <p style={{
              fontSize: 13, color: 'var(--gray-500)', textAlign: 'center', padding: 16,
            }}>
              Sin intervenciones registradas
            </p>
          ) : (
            data.intervenciones?.map((i) => (
              <div key={i.id} style={{
                padding: '8px 0', borderBottom: '1px solid var(--gray-100)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>
                    {i.servicio || i.diagnostico}
                  </p>
                  <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                    {new Date(i.fecha).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'var(--gray-500)' }}>
                  {i.mecanico} - {i.kilometraje?.toLocaleString()} km
                </p>
                {i.componentes?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                    {i.componentes.map((c, idx) => (
                      <span key={idx} style={{
                        background: 'var(--gray-100)', padding: '2px 6px',
                        borderRadius: 4, fontSize: 10,
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
    </div>
  );
}
