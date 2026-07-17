import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

export function UpdateKM() {
  const navigate = useNavigate();
  const [currentKm, setCurrentKm] = useState(0);
  const [newKm, setNewKm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [vehicleId, setVehicleId] = useState('');

  useEffect(() => {
    api.get('/vehicles/my')
      .then((res) => {
        setCurrentKm(res.data.ultimoKilometraje || 0);
        setVehicleId(res.data.id);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async () => {
    const km = parseInt(newKm, 10);
    if (isNaN(km) || km <= currentKm) {
      setError(
        `El kilometraje debe ser mayor a ${currentKm.toLocaleString()} km`,
      );
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.patch(`/vehicles/${vehicleId}/kilometraje`, { kilometraje: km });
      setSuccess(true);
      setTimeout(() => navigate('/client'), 1500);
    } catch {
      setError('Error al actualizar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

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
          Actualizar Kilometraje
        </h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: 'white', borderRadius: 12, padding: 20, textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}>
          <p style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>
            Kilometraje Actual
          </p>
          <p style={{
            fontSize: 28, fontWeight: 700, color: 'var(--primary-500)',
          }}>
            {currentKm.toLocaleString()} km
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--success)' }}>
              Kilometraje actualizado!
            </p>
          </div>
        ) : (
          <>
            <div>
              <label style={{
                fontSize: 13, color: 'var(--gray-700)', marginBottom: 6, display: 'block',
              }}>
                Nuevo Kilometraje
              </label>
              <input
                type="number"
                value={newKm}
                onChange={(e) => setNewKm(e.target.value)}
                placeholder="Ej: 50000"
                autoFocus
                style={{
                  width: '100%', padding: '14px', border: '1px solid var(--gray-300)',
                  borderRadius: 8, fontSize: 18, textAlign: 'center', outline: 'none',
                }}
              />
            </div>

            {error && <p style={{ color: 'var(--error)', fontSize: 13 }}>{error}</p>}

            <div style={{
              background: 'var(--info)', color: 'white', borderRadius: 8,
              padding: 12, fontSize: 12, lineHeight: 1.5,
            }}>
              Mantener tu kilometraje actualizado permite al sistema predecir con
              precision cuando necesitaras tu proximo mantenimiento.
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading || !newKm}
              style={{
                width: '100%', padding: 14,
                background: loading ? 'var(--gray-500)' : 'var(--accent)',
                color: 'white', borderRadius: 8, fontSize: 15, fontWeight: 600,
                border: 'none',
              }}
            >
              {loading ? 'Actualizando...' : 'Actualizar Kilometraje'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
