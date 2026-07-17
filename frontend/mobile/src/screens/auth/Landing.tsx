import { useNavigate } from 'react-router-dom';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'var(--primary-500)', padding: '60px 24px 40px', borderRadius: '0 0 32px 32px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ background: 'var(--accent)', color: 'white', fontWeight: 800, fontSize: 24, padding: '8px 12px', borderRadius: 8 }}>M3</div>
          <span style={{ color: 'white', fontSize: 24, fontWeight: 600 }}>Motors</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16 }}>Mantenimiento Predictivo</p>
      </div>

      <div style={{ flex: 1, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Historial de Servicios</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>Accede al historial completo de mantenimientos de tu vehículo.</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Alertas Inteligentes</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>Recibe notificaciones predictivas antes de que ocurra una falla.</p>
        </div>
        <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Código QR</h3>
          <p style={{ fontSize: 14, color: 'var(--gray-700)' }}>Accede rápido a la información de tu vehículo escaneando su QR.</p>
        </div>
      </div>

      <div style={{ padding: '16px 24px 32px' }}>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '14px', background: 'var(--primary-500)', color: 'white',
            borderRadius: 8, fontSize: 16, fontWeight: 600, border: 'none',
          }}
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
