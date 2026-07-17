import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Capacitor } from '@capacitor/core'

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

type UserRole = 'admin' | 'mechanic' | 'client'

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}) {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

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

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  const userRole = (user?.publicMetadata?.role as UserRole) || 'client'

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function MobileRoleRedirect() {
  const { isLoaded, isSignedIn } = useAuth()
  const { user } = useUser()

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

  if (!isSignedIn) {
    return <Navigate to="/" replace />
  }

  const userRole = (user?.publicMetadata?.role as UserRole) || 'client'

  if (userRole === 'mechanic') {
    return <Navigate to="/mobile/mechanic" replace />
  }
  return <Navigate to="/mobile/client" replace />
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      afterSignOutUrl="/"
      appearance={clerkAppearance}
      taskUrls={{
        'choose-organization': '/dashboard',
      }}
    >
      <HashRouter>
        <Routes>
          {/* Public — Mobile gets its own landing */}
          <Route path="/" element={isNative ? <MobileLanding /> : <Landing />} />
          <Route path="/login" element={<Login />} />
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

          {/* Web — Clerk-based dashboards */}
          <Route path="/dashboard/perfil" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          {!isNative && (
            <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          )}
          <Route path="/dashboard/cliente" element={<ProtectedRoute allowedRoles={['client']}><PanelCliente /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ClerkProvider>
  )
}
