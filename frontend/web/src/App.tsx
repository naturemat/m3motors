import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PanelCliente from './pages/PanelCliente'
import WorkshopDashboard from './pages/WorkshopDashboard'
import PublicLanding from './pages/PublicLanding'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

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
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/workshop/:id" element={<PublicLanding />} />

          {/* Protected — main dashboard (old workshop panel) */}
          <Route path="/dashboard" element={<ProtectedRoute><WorkshopDashboard /></ProtectedRoute>} />

          {/* Protected — Clerk-based dashboards */}
          <Route path="/dashboard/perfil" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/dashboard/cliente" element={<ProtectedRoute allowedRoles={['client']}><PanelCliente /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  )
}
