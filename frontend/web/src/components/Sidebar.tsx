import { LayoutDashboard, Users, Wrench, UserCog, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  mobileOpen?: boolean;
  setMobileOpen?: (open: boolean) => void;
  user?: { firstName?: string | null; lastName?: string | null; emailAddresses?: { emailAddress: string }[] } | null;
}

export default function Sidebar({ activeTab, setActiveTab, onLogout, mobileOpen, setMobileOpen, user }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'clients', name: 'Clientes', icon: Users },
    { id: 'services', name: 'Servicios', icon: Wrench },
    { id: 'mechanics', name: 'Mecánicos', icon: UserCog },
    { id: 'settings', name: 'Ajustes', icon: Settings },
  ];

  const userName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || 'Admin User' : 'Admin User';
  const userInitials = user ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase() || 'AD' : 'AD';
  const userEmail = user?.emailAddresses?.[0]?.emailAddress ?? 'admin@m3motors.com';

  const content = (
    <div className="flex flex-col h-full bg-[#003b5a] text-white">
      {/* Brand Header */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="bg-white/10 p-2 rounded-lg">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-6 h-6 object-contain" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white leading-none">M3Motors</h1>
          <span className="text-[10px] uppercase tracking-wider text-sky-200 font-semibold opacity-80">
            Admin Panel
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (setMobileOpen) setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#1a5276] text-white shadow-md shadow-black/10'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin User Profile Section */}
      <div className="p-4 border-t border-white/10 bg-black/15 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1a5276] flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-white">{userInitials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate text-white leading-none mb-1">{userName}</p>
            <span className="text-[10px] text-sky-200/75 uppercase font-medium tracking-wider">
              {userEmail}
            </span>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-300 hover:text-white bg-red-950/20 hover:bg-red-600/20 rounded-md border border-red-500/30 hover:border-red-500/50 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 h-screen shrink-0 sticky top-0 border-r border-slate-200/50 shadow-xl print:hidden">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen && setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#003b5a] shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
