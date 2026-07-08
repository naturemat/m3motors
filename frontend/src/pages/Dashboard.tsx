import { useUser, useAuth, UserButton } from '@clerk/clerk-react'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    async function fetchProfile() {
      const token = await getToken()
      const res = await fetch('http://localhost:3000/auth/me', {
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
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">M3Motors Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.firstName}</span>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Bienvenido, {user?.firstName}</h2>

        {profile && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Tu Perfil</h3>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>ID:</strong> {profile.id}</p>

            {profile.organizations?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Organizaciones:</h4>
                {profile.organizations.map((org: any) => (
                  <div key={org.id} className="bg-gray-50 p-3 rounded mb-2">
                    <p><strong>{org.name}</strong></p>
                    <p className="text-sm text-gray-500">Rol: {org.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Vehículos</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Intervenciones</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Alertas Activas</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>
      </main>
    </div>
  )
}
