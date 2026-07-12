import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut } from '@clerk/clerk-react'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import PublicLanding from './pages/PublicLanding'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <SignedIn>{children}</SignedIn>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  return <SignedOut>{children}</SignedOut>
}

function App() {
  return (
    <Routes>
      {/* Login — pantalla principal para el dueño del taller */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Panel de administración del taller (requiere login) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Landing pública de un taller específico (para que clientes se pre-registren) */}
      <Route path="/workshop/:id" element={<PublicLanding />} />

      {/* Cualquier otra ruta → login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}

export default App
