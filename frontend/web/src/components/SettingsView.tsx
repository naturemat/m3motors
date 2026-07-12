import React, { useState } from 'react';
import {
  Globe,
  DollarSign,
  Wrench,
  ShieldCheck,
  Trash2,
  Check,
  Bell,
  Mail
} from 'lucide-react';

interface SettingsProps {
  onResetData: () => void;
}

export default function SettingsView({ onResetData }: SettingsProps) {
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('es');
  const [workshopName, setWorkshopName] = useState('M3Motors Workshop');
  const [successMsg, setSuccessMsg] = useState('');

  const [emailNotifications, setEmailNotifications] = useState<boolean>(() => {
    const stored = localStorage.getItem('m3_email_notifications');
    return stored === null ? true : stored === 'true';
  });

  const [pushNotifications, setPushNotifications] = useState<boolean>(() => {
    const stored = localStorage.getItem('m3_push_notifications');
    return stored === 'true';
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('m3_email_notifications', String(emailNotifications));
    localStorage.setItem('m3_push_notifications', String(pushNotifications));
    setSuccessMsg('Ajustes guardados exitosamente.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const triggerReset = () => {
    if (confirm('¿Estás seguro de que deseas restablecer los datos de demostración del taller?')) {
      onResetData();
      setEmailNotifications(true);
      setPushNotifications(false);
      localStorage.setItem('m3_email_notifications', 'true');
      localStorage.setItem('m3_push_notifications', 'false');
      setSuccessMsg('Datos restablecidos al estado inicial.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="flex-1 min-w-0 bg-[#f8fafb]">
      <header className="sticky top-0 z-30 bg-[#003b5a] text-white px-6 py-4 shadow-md flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Configuración del Sistema</h2>
          <span className="text-xs text-sky-200/80 font-medium">Parámetros del Panel de Control</span>
        </div>
      </header>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        {successMsg && (
          <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-4 rounded-xl flex items-center gap-2 border border-emerald-200 shadow-md">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/60 shadow-[0_4px_12px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 text-sm">Ajustes Generales del Taller</h3>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nombre de la Empresa / Taller</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Wrench className="w-4 h-4 text-slate-400" /></span>
                <input type="text" required value={workshopName} onChange={(e) => setWorkshopName(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 text-slate-800 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#1a5276] transition-all" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Idioma del Panel</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><Globe className="w-4 h-4 text-slate-400" /></span>
                  <select value={language} onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                    <option value="es">Español (Castellano)</option>
                    <option value="en">English (US)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Moneda de Facturación</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><DollarSign className="w-4 h-4 text-slate-400" /></span>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#1a5276] focus:bg-white transition-all cursor-pointer">
                    <option value="USD">Dólar Americano ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-[#003b5a]" /> Preferencias de Notificación
              </h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-[#006397] mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-700">Notificaciones por Correo</span>
                      <span className="text-[11px] text-slate-400">Recibir alertas de órdenes de servicio creadas y completadas.</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${emailNotifications ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${emailNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200/50">
                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-[#006397] mt-0.5" />
                    <div>
                      <span className="block text-xs font-bold text-slate-700">Notificaciones Push</span>
                      <span className="text-[11px] text-slate-400">Alertas instantáneas en el navegador al actualizar mecánicos o estados.</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setPushNotifications(!pushNotifications)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${pushNotifications ? 'bg-emerald-600' : 'bg-slate-200'}`}>
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${pushNotifications ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[#006397] shrink-0" />
              <div>
                <span className="block text-xs font-bold text-slate-700">Licencia de Propietario Activa</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">M3M-OWN-9281-2026-OK</span>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
            <button type="submit" className="bg-[#003b5a] hover:bg-[#1a5276] text-white text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer">Guardar Cambios</button>
          </div>
        </form>

        <div className="bg-red-50/50 rounded-xl border border-red-200/60 p-6 space-y-4">
          <div className="space-y-1">
            <h4 className="font-bold text-red-900 text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-700" /> Zona de Restablecimiento
            </h4>
            <p className="text-xs text-red-700">
              Usa este botón si deseas revertir las modificaciones locales y recargar los datos del taller original.
            </p>
          </div>
          <button type="button" onClick={triggerReset}
            className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-md active:scale-95 cursor-pointer">
            Restablecer Todos los Datos
          </button>
        </div>
      </div>
    </div>
  );
}
