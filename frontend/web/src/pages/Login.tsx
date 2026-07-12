import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
            <span className="text-3xl font-bold">M3</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">M3Motors</h1>
          <p className="text-xl text-white/80 mb-8">
            Gestión inteligente para talleres mecánicos
          </p>
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">1</div>
              <span className="text-white/90">Controla el historial de cada vehículo</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">2</div>
              <span className="text-white/90">Alertas predictivas de mantenimiento</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-sm">3</div>
              <span className="text-white/90">Gestiona mecánicos, servicios y clientes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Panel derecho — login */}
      <div className="flex-1 flex items-center justify-center p-6 bg-neutral-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">M3</span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900">M3Motors</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">Iniciar sesión</h2>
            <p className="text-sm text-neutral-600 mb-6">
              Accede al panel de administración de tu taller
            </p>

            <SignIn
              routing="path"
              path="/"
              appearance={{
                elements: {
                  rootBox: 'mx-auto',
                  card: 'shadow-none',
                },
              }}
            />
          </div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            ¿No tienes cuenta? Contacta al administrador de la plataforma.
          </p>
        </div>
      </div>
    </div>
  )
}
