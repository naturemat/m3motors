import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react'
import Landing from './pages/Landing'
import PublicLanding from './pages/PublicLanding'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import PanelCliente from './pages/PanelCliente'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <SignedIn>{children}</SignedIn>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <SignedOut>{children}</SignedOut>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const role = user?.publicMetadata?.role as string | undefined
  if (role !== 'admin') {
    return <Navigate to="/dashboard" />
  }
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicLanding />} />
      <Route path="/landing/:id" element={<Landing />} />
      <Route
        path="/login/*"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register/*"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/cliente"
        element={
          <ProtectedRoute>
            <PanelCliente />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
