import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchHistorialByQR } from '@/services/vehicle';

export function QRScanner() {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!qrCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      const data = await fetchHistorialByQR(qrCode.trim());
      navigate(`/mechanic/vehicle/${data.id}`);
    } catch {
      setError('Codigo QR no valido. Verifica e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: 16 }}>
      <div style={{
        background: 'white', borderRadius: 16, padding: 32, textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
          Escanear Codigo QR
        </h2>
        <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 20 }}>
          Ingresa el codigo QR del vehiculo
        </p>

        <input
          value={qrCode}
          onChange={(e) => setQrCode(e.target.value)}
          placeholder="Codigo QR"
          autoFocus
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--gray-300)',
            borderRadius: 8, fontSize: 15, textAlign: 'center', marginBottom: 12,
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'var(--primary-500)'; }}
          onBlur={(e) => { e.target.style.borderColor = 'var(--gray-300)'; }}
        />

        {error && (
          <p style={{ color: 'var(--error)', fontSize: 13, marginBottom: 12 }}>{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !qrCode.trim()}
          style={{
            width: '100%', padding: 14,
            background: loading ? 'var(--gray-500)' : 'var(--primary-500)',
            color: 'white', borderRadius: 8, fontSize: 15, fontWeight: 600,
            border: 'none',
          }}
        >
          {loading ? 'Buscando...' : 'Buscar Vehiculo'}
        </button>

        <button
          onClick={() => navigate('/mechanic')}
          style={{ marginTop: 12, color: 'var(--gray-700)', fontSize: 14, padding: '8px 16px' }}
        >
          Volver
        </button>
      </div>
    </div>
  );
}
