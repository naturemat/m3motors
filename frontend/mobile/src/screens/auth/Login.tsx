import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Error al iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8,
        }}>
          <div style={{
            background: 'var(--accent)', color: 'white', fontWeight: 800,
            fontSize: 20, padding: '6px 10px', borderRadius: 6,
          }}>
            M3
          </div>
          <span style={{ color: 'var(--primary-500)', fontSize: 20, fontWeight: 600 }}>
            Motors
          </span>
        </div>
        <p style={{ color: 'var(--gray-700)', fontSize: 14 }}>
          Inicia sesion para continuar
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
      >
        {error && (
          <div style={{
            padding: 12, background: 'var(--error)', color: 'white',
            borderRadius: 8, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        <div>
          <label style={{
            display: 'block', fontSize: 13, color: 'var(--gray-700)',
            marginBottom: 6, fontWeight: 500,
          }}>
            Correo electronico
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="correo@ejemplo.com"
            required
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 15,
              outline: 'none',
            }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--primary-500)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--gray-300)'; }}
          />
        </div>

        <div>
          <label style={{
            display: 'block', fontSize: 13, color: 'var(--gray-700)',
            marginBottom: 6, fontWeight: 500,
          }}>
            Contrasena
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
              style={{
                width: '100%', padding: '12px 14px',
                border: '1px solid var(--gray-300)', borderRadius: 8, fontSize: 15,
                outline: 'none',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--primary-500)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--gray-300)'; }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute', right: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--gray-500)',
                fontSize: 13,
              }}
            >
              {showPassword ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%', padding: 14,
            background: loading ? 'var(--gray-500)' : 'var(--primary-500)',
            color: 'white', borderRadius: 8, fontSize: 16, fontWeight: 600,
            border: 'none', marginTop: 8,
          }}
        >
          {loading ? 'Iniciando...' : 'Iniciar Sesion'}
        </button>
      </form>
    </div>
  );
}
