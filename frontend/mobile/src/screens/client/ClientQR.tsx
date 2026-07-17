import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';

export function ClientQR() {
  const navigate = useNavigate();
  const [qrData, setQrData] = useState('');
  const [vehicleInfo, setVehicleInfo] = useState('');

  useEffect(() => {
    api.get('/vehicles/my')
      .then((res) => {
        setQrData(
          res.data.qrCode
          || `${import.meta.env.VITE_API_URL}/vehicles/qr/${res.data.id}`,
        );
        setVehicleInfo(`${res.data.marca} ${res.data.modelo} - ${res.data.placa}`);
      })
      .catch(() => {});
  }, []);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'M3Motors - Mi QR', text: qrData });
    } else {
      await navigator.clipboard.writeText(qrData);
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
          Mi Codigo QR
        </h1>
      </div>

      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{
          background: 'white', borderRadius: 16, padding: 32,
          marginBottom: 16, textAlign: 'center', width: '100%', maxWidth: 280,
        }}>
          {qrData ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`}
              alt="QR"
              style={{ width: 200, height: 200, margin: '0 auto', borderRadius: 8 }}
            />
          ) : (
            <div style={{
              width: 200, height: 200, background: 'var(--gray-100)', borderRadius: 8,
              margin: '0 auto', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: 'var(--gray-500)', fontSize: 14,
            }}>
              Cargando...
            </div>
          )}
        </div>

        {vehicleInfo && (
          <p style={{ fontSize: 14, color: 'var(--gray-700)', marginBottom: 16 }}>
            {vehicleInfo}
          </p>
        )}

        <button
          onClick={handleShare}
          style={{
            width: '100%', maxWidth: 280, padding: 14,
            background: 'var(--primary-500)', color: 'white', borderRadius: 8,
            fontSize: 15, fontWeight: 600, border: 'none',
          }}
        >
          {navigator.share ? 'Compartir QR' : 'Copiar QR'}
        </button>
      </div>
    </div>
  );
}
