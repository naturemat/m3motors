import { useEffect } from 'react';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth';
import { LoadingScreen } from '@/screens/LoadingScreen';
import { Landing } from '@/screens/auth/Landing';
import { Login } from '@/screens/auth/Login';
import { MechanicDashboard } from '@/screens/mechanic/MechanicDashboard';
import { QRScanner } from '@/screens/mechanic/QRScanner';
import { VehicleHistory } from '@/screens/mechanic/VehicleHistory';
import { CustomerSearch } from '@/screens/mechanic/CustomerSearch';
import { ClientDashboard } from '@/screens/client/ClientDashboard';
import { ClientHistory } from '@/screens/client/ClientHistory';
import { ClientQR } from '@/screens/client/ClientQR';
import { ClientProfile } from '@/screens/client/ClientProfile';
import { UpdateKM } from '@/screens/client/UpdateKM';
import type { UserRole } from '@/types';
import OneSignal from '@onesignal/capacitor-plugin';

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

function AuthLoader({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoaded) {
      setLoading(true);
      return;
    }

    if (isSignedIn && clerkUser) {
      setLoading(true);
      getToken().then((token) => {
        if (token) localStorage.setItem('clerk_token', token);
      });

      authService
        .getMe()
        .then((userData) => {
          setUser({
            id: String(userData.id),
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: (userData.role as UserRole) || 'client',
          });
        })
        .catch(() => {
          const clerkRole = clerkUser.publicMetadata?.role as UserRole | undefined;
          setUser({
            id: clerkUser.id,
            email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            role: clerkRole || 'client',
          });
        })
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [isLoaded, isSignedIn, clerkUser, setUser, setLoading, getToken]);

  return <>{children}</>;
}

function ProtectedRoute({ role, children }: { role?: UserRole; children: React.ReactNode }) {
  const { user, isLoading } = useAuthStore();

  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'client' ? '/client' : '/mechanic'} replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />

      <Route path="/mechanic" element={<ProtectedRoute role="mechanic"><MechanicDashboard /></ProtectedRoute>} />
      <Route path="/mechanic/qr-scanner" element={<ProtectedRoute role="mechanic"><QRScanner /></ProtectedRoute>} />
      <Route path="/mechanic/vehicle/:id" element={<ProtectedRoute role="mechanic"><VehicleHistory /></ProtectedRoute>} />
      <Route path="/mechanic/customers" element={<ProtectedRoute role="mechanic"><CustomerSearch /></ProtectedRoute>} />

      <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
      <Route path="/client/history" element={<ProtectedRoute role="client"><ClientHistory /></ProtectedRoute>} />
      <Route path="/client/qr" element={<ProtectedRoute role="client"><ClientQR /></ProtectedRoute>} />
      <Route path="/client/profile" element={<ProtectedRoute role="client"><ClientProfile /></ProtectedRoute>} />
      <Route path="/client/update-km" element={<ProtectedRoute role="client"><UpdateKM /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function OneSignalInit() {
  useEffect(() => {
    const appId = import.meta.env.VITE_ONESIGNAL_APP_ID;
    if (!appId) return;

    (async () => {
      try {
        await OneSignal.initialize(appId);
        await OneSignal.Notifications.requestPermission(true);
      } catch {
        // OneSignal no disponible en web/dev
      }
    })();
  }, []);

  return null;
}

export default function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <OneSignalInit />
        <AuthLoader>
          <div style={{ minHeight: '100vh', background: '#F4F6F7' }}>
            <AppRoutes />
          </div>
        </AuthLoader>
      </BrowserRouter>
    </ClerkProvider>
  );
}
