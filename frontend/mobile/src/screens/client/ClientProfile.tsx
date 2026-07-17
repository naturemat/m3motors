import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useAuthStore } from '@/store/authStore';

export function ClientProfile() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { signOut } = useClerk();
  const logout = useAuthStore((s) => s.logout);
  const [name, setName] = useState(user?.firstName || '');
  const [phone, setPhone] = useState('');
  const [email] = useState(user?.emailAddresses?.[0]?.emailAddress || '');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = async () => {
    await signOut();
    logout();
    navigate('/');
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
          Mi Perfil
        </h1>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{
          background: 'white', borderRadius: 12, padding: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          <div>
            <label style={{
              fontSize: 12, color: 'var(--gray-500)', marginBottom: 4, display: 'block',
            }}>
              Nombre
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
                borderRadius: 8, fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, color: 'var(--gray-500)', marginBottom: 4, display: 'block',
            }}>
              Telefono
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0999999999"
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--gray-300)',
                borderRadius: 8, fontSize: 14, outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{
              fontSize: 12, color: 'var(--gray-500)', marginBottom: 4, display: 'block',
            }}>
              Correo
            </label>
            <input
              value={email}
              disabled
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--gray-200)',
                borderRadius: 8, fontSize: 14, background: 'var(--gray-100)',
                color: 'var(--gray-500)',
              }}
            />
          </div>
        </div>

        <button
          onClick={handleSave}
          style={{
            width: '100%', padding: 14, background: 'var(--primary-500)',
            color: 'white', borderRadius: 8, fontSize: 15, fontWeight: 600,
            border: 'none',
          }}
        >
          {saved ? 'Guardado' : 'Guardar Cambios'}
        </button>

        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: 14, background: 'white', color: 'var(--error)',
            borderRadius: 8, fontSize: 15, fontWeight: 600,
            border: '1px solid var(--error)',
          }}
        >
          Cerrar Sesion
        </button>
      </div>
    </div>
  );
}
