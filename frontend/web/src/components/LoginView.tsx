import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('admin@m3motors.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const box = card.getBoundingClientRect();
    const x = e.clientX - box.left - box.width / 2;
    const y = e.clientY - box.top - box.height / 2;
    setRotateX(-y / 15);
    setRotateY(x / 15);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '') {
      setError('Por favor, ingresa tu correo electrónico.');
      return;
    }
    onLogin();
  };

  const handleQuickLogin = (role: 'admin' | 'guest') => {
    if (role === 'admin') {
      setEmail('admin@m3motors.com');
    } else {
      setEmail('invitado@m3motors.com');
    }
    onLogin();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-[#f8fafb]"
      style={{
        backgroundImage: 'radial-gradient(#c1c7cf 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Decorative Glow Elements */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#71c0fe] opacity-10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-[#1a5276] opacity-10 blur-3xl rounded-full pointer-events-none" />

      <main className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Login Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
              transition: rotateX === 0 ? 'transform 0.5s ease' : 'none',
            }}
            className="w-full max-w-md bg-white rounded-xl p-8 border border-slate-200/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] flex flex-col gap-6"
          >
            {/* Logo Section */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-16 h-16 flex items-center justify-center bg-[#003b5a]/5 rounded-2xl mb-2">
                <img
                  src="/Logo_M3Motors.png"
                  alt="M3Motors Logo"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <h1 className="text-3xl font-extrabold text-[#003b5a] tracking-tight text-center leading-none">M3Motors</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase text-center mt-1">
                Panel de Administración
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3 rounded-lg flex items-center gap-2 border border-red-200">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@m3motors.com"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-[#1a5276] focus:ring-4 focus:ring-[#1a5276]/5 transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1" htmlFor="password">
                  Contraseña
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Lock className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 text-slate-800 text-sm focus:outline-none focus:border-[#1a5276] focus:ring-4 focus:ring-[#1a5276]/5 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-1 px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#003b5a] focus:ring-[#003b5a]"
                  />
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                    Recordarme
                  </span>
                </label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); alert('Enlace de recuperación enviado al correo registrado.'); }}
                  className="text-xs font-bold text-[#006397] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <button
                type="submit"
                className="w-full bg-[#003b5a] hover:bg-[#1a5276] text-white font-bold py-3.5 rounded-lg shadow-md hover:shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 mt-2 cursor-pointer text-sm"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-col gap-2 pt-2">
              <span className="text-[10px] text-center font-bold uppercase text-slate-400 tracking-wider">
                Acceso Rápido de Demostración
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  className="px-3 py-2 text-xs font-bold bg-[#003b5a]/5 text-[#003b5a] hover:bg-[#003b5a]/10 border border-[#003b5a]/15 rounded-lg transition-colors cursor-pointer"
                >
                  Administrador (Demo)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin('guest')}
                  className="px-3 py-2 text-xs font-bold bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  Invitado (Demo)
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-2">
              <p className="text-center text-[10px] text-slate-400 font-semibold leading-relaxed">
                Acceso restringido únicamente a personal autorizado.
                <br />
                Sistema de Gestión de Talleres M3Motors v4.2.0
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Workshop Image */}
        <div className="hidden lg:block lg:col-span-6 h-[500px] rounded-2xl overflow-hidden relative shadow-2xl border border-slate-200">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat transition-transform duration-1000 hover:scale-105"
            style={{
              backgroundImage: `url('/Logo_M3Motors.png')`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundColor: '#003b5a',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#003b5a]/90 via-[#003b5a]/40 to-transparent flex flex-col justify-end p-8 text-white">
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight">Gestión Inteligente de Talleres</h2>
              <p className="text-xs text-sky-100/80 leading-relaxed max-w-md">
                Mantenimiento predictivo, historial vehicular y comunicación directa con tus clientes.
                Todo en una sola plataforma.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
