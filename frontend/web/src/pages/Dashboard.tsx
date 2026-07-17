import { useUser, useAuth, UserButton } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export default function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  const role = user?.publicMetadata?.role as string | undefined

  useEffect(() => {
    async function fetchProfile() {
      const token = await getToken()
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    }
    fetchProfile()
  }, [getToken])

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/Logo_M3Motors.png" alt="M3Motors" className="h-7" />
          <div className="flex items-center gap-4">
            <span className="text-neutral-600">{user?.firstName}</span>
            <UserButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6 text-neutral-900">Bienvenido, {user?.firstName}</h2>

        {profile && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tu Perfil</h3>
            <p className="text-neutral-700"><strong>Email:</strong> {profile.email}</p>
            <p className="text-neutral-700"><strong>ID:</strong> {profile.id}</p>

            {profile.organizations?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Organizaciones:</h4>
                {profile.organizations.map((org: any) => (
                  <div key={org.id} className="bg-neutral-100 p-3 rounded-lg mb-2">
                    <p className="font-semibold">{org.name}</p>
                    <p className="text-sm text-neutral-600">Rol: {org.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {role === 'admin' ? (
            <Link to="/dashboard/admin" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-primary">Panel Admin</h3>
              <p className="text-sm text-neutral-600">Gestionar taller, mecanicos y servicios</p>
            </Link>
          ) : (
            <Link to="/dashboard/cliente" className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold mb-2 text-primary">Mi Vehiculo</h3>
              <p className="text-sm text-neutral-600">Ver historial y actualizar kilometraje</p>
            </Link>
          )}

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2 text-success">Estado</h3>
            <p className="text-sm text-neutral-600">Rol: <span className="font-semibold capitalize">{role ?? 'usuario'}</span></p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-2 text-secondary">Soporte</h3>
            <p className="text-sm text-neutral-600">Contacta al administrador del taller</p>
          </div>
        </div>
      </main>
    </div>
  )
}
