import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersService } from '@/services/customers';
import type { Customer } from '@/types';

const statusFilters = [
  { label: 'Todos', value: '' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Activados', value: 'ACTIVATED' },
];

export function CustomerSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const search = useCallback(async () => {
    setLoading(true);
    try {
      const data = await customersService.searchPreRegisteredCustomers({
        q: query || undefined,
        status: status || undefined,
        skip: 0,
        take: 20,
      });
      setCustomers(data);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    const timer = setTimeout(search, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={() => navigate('/mechanic')} style={{ fontSize: 18 }}>
          {'<'}
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 600 }}>Buscar Clientes</h1>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por nombre o placa..."
        style={{
          width: '100%', padding: '12px 14px', border: '1px solid var(--gray-300)',
          borderRadius: 8, fontSize: 14, marginBottom: 12, outline: 'none',
        }}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 13,
              border: status === f.value
                ? '2px solid var(--primary-500)'
                : '1px solid var(--gray-300)',
              background: status === f.value ? 'var(--primary-500)' : 'white',
              color: status === f.value ? 'white' : 'var(--gray-700)',
              fontWeight: 500,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              height: 60, background: 'var(--gray-100)', borderRadius: 8,
              animation: 'pulse 1.5s infinite',
            }} />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--gray-500)', padding: 32 }}>
          Sin resultados
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {customers.map((c) => (
            <div key={c.id} style={{
              background: 'white', borderRadius: 10, padding: 12,
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 14 }}>{c.nombre}</p>
                  <p style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                    {c.licensePlate} - {c.telefono}
                  </p>
                </div>
                <span style={{
                  background: c.status === 'PENDING' ? 'var(--warning)' : 'var(--success)',
                  color: 'white', padding: '2px 8px', borderRadius: 12, fontSize: 11,
                }}>
                  {c.status}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={() => navigate(`/mechanic/vehicle/${c.vehicleId}`)}
                  style={{
                    padding: '6px 12px', background: 'var(--primary-500)',
                    color: 'white', borderRadius: 6, fontSize: 12,
                  }}
                >
                  Ver
                </button>
                {c.status === 'PENDING' && (
                  <button style={{
                    padding: '6px 12px', background: 'var(--accent)',
                    color: 'white', borderRadius: 6, fontSize: 12,
                  }}>
                    Activar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
