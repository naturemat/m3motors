import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'
import { useState, useEffect } from 'react'
import axios from 'axios'

import Landing from './pages/Landing'
import MobileLanding from './pages/MobileLanding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PanelCliente from './pages/PanelCliente'
import WorkshopDashboard from './pages/WorkshopDashboard'
import PublicLanding from './pages/PublicLanding'

import MobileClientDashboard from './pages/mobile/MobileClientDashboard'
import MobileClientHistory from './pages/mobile/MobileClientHistory'
import MobileClientQR from './pages/mobile/MobileClientQR'
import MobileClientProfile from './pages/mobile/MobileClientProfile'
import MobileMechanicDashboard from './pages/mobile/MobileMechanicDashboard'
import MobileMechanicQRScanner from './pages/mobile/MobileMechanicQRScanner'
import MobileMechanicVehicleHistory from './pages/mobile/MobileMechanicVehicleHistory'
import MobileMechanicCustomers from './pages/mobile/MobileMechanicCustomers'
import MobileMechanicInterventions from './pages/mobile/MobileMechanicInterventions'
import MobileMechanicRegisterVehicle from './pages/mobile/MobileMechanicRegisterVehicle'
import MobileMechanicCreateIntervention from './pages/mobile/MobileMechanicCreateIntervention'
import MobileMechanicManualIntervention from './pages/mobile/MobileMechanicManualIntervention'
import MobileMechanicServices from './pages/mobile/MobileMechanicServices'
import MobileLogin from './pages/mobile/MobileLogin'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const isNative = Capacitor.isNativePlatform()

const clerkAppearance = {
  variables: {
    colorPrimary: '#1A5276',
    colorText: '#2C3E50',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#FFFFFF',
    colorInputText: '#2C3E50',
  },
  elements: {
    formButtonPrimary: 'bg-[#1A5276] hover:bg-[#154360] text-white transition-colors shadow-md',
    socialButtonsBlockButton: 'border-[#E2E8F0] text-[#2C3E50] hover:bg-[#F4F6F7]',
    footerActionLink: 'text-[#2E86C1] hover:text-[#1A5276]',
    card: 'shadow-lg rounded-xl border border-[#E2E8F0]/60',
    headerTitle: 'text-[#2C3E50]',
    headerSubtitle: 'text-[#5D6D7E]',
  },
}

function ClerkProviderWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
    >
      {children}
    </ClerkProvider>
  )
}

type UserRole = 'admin' | 'mechanic' | 'client'

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}) {
  const { isSignedIn, getToken, isLoaded } = useAuth()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mobile: check localStorage
    if (isNative) {
      const mobileUser = localStorage.getItem('mobile_user')
      if (mobileUser) {
        const user = JSON.parse(mobileUser)
        setRole(user.role)
      }
      setLoading(false)
      return
    }

    // Web: use Clerk
    const fetchRole = async () => {
      if (!isSignedIn) {
        setLoading(false)
        return
      }
      try {
        const token = await getToken()
        const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
        const res = await axios.get(`${apiUrl}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setRole(res.data.role ?? 'client')
      } catch {
        setRole('client')
      } finally {
        setLoading(false)
      }
    }
    void fetchRole()
  }, [isSignedIn, getToken])

  // Wait for Clerk to initialize before making auth decisions
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <div className="text-center">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-[#5D6D7E] text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <div className="text-center">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-[#5D6D7E] text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mobile: check localStorage
  if (isNative) {
    const mobileUser = localStorage.getItem('mobile_user')
    if (!mobileUser) {
      return <Navigate to="/login" replace />
    }
  } else {
    // Web: check Clerk
    if (!isSignedIn) {
      return <Navigate to="/login" replace />
    }
  }

  if (allowedRoles && role && !allowedRoles.includes(role as UserRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function MobileRoleRedirect() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const mobileUser = localStorage.getItem('mobile_user')
    if (mobileUser) {
      const user = JSON.parse(mobileUser)
      setRole(user.role)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
        <div className="text-center">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p className="text-[#5D6D7E] text-sm">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!role) {
    return <Navigate to="/" replace />
  }

  if (role === 'mechanic') {
    return <Navigate to="/mobile/mechanic" replace />
  }
  return <Navigate to="/mobile/client" replace />
}

export default function App() {
  return (
    <HashRouter>
      <ClerkProviderWithRouter>
        <Routes>
          {/* Public — Mobile gets its own landing and login */}
          <Route path="/" element={isNative ? <MobileLanding /> : <Landing />} />
          <Route path="/login" element={isNative ? <MobileLogin /> : <Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workshop/:id" element={<PublicLanding />} />

          {/* Mobile role redirect — authenticated users go to their dashboard */}
          <Route path="/dashboard" element={
            isNative ? <MobileRoleRedirect /> : <ProtectedRoute><WorkshopDashboard /></ProtectedRoute>
          } />

          {/* Mobile — Client routes */}
          <Route path="/mobile/client" element={
            <ProtectedRoute allowedRoles={['client']}><MobileClientDashboard /></ProtectedRoute>
          } />
          <Route path="/mobile/client/history" element={
            <ProtectedRoute allowedRoles={['client']}><MobileClientHistory /></ProtectedRoute>
          } />
          <Route path="/mobile/client/qr" element={
            <ProtectedRoute allowedRoles={['client']}><MobileClientQR /></ProtectedRoute>
          } />
          <Route path="/mobile/client/profile" element={
            <ProtectedRoute allowedRoles={['client']}><MobileClientProfile /></ProtectedRoute>
          } />

          {/* Mobile — Mechanic routes */}
          <Route path="/mobile/mechanic" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicDashboard /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/scanner" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicQRScanner /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/vehicle/:id" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicVehicleHistory /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/vehicle/:id/intervene" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicCreateIntervention /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/customers" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicCustomers /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/interventions" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicInterventions /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/register-vehicle" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicRegisterVehicle /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/manual-intervention" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicManualIntervention /></ProtectedRoute>
          } />
          <Route path="/mobile/mechanic/services" element={
            <ProtectedRoute allowedRoles={['mechanic']}><MobileMechanicServices /></ProtectedRoute>
          } />

          {/* Web — Clerk-based dashboards */}
          <Route path="/dashboard/perfil" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {!isNative && (
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          )}
          <Route path="/dashboard/cliente" element={<ProtectedRoute allowedRoles={['client']}><PanelCliente /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ClerkProviderWithRouter>
    </HashRouter>
  )
}
