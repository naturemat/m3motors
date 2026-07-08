import { SignUp } from '@clerk/clerk-react'

export default function Register() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6">M3Motors</h1>
        <SignUp
          routing="path"
          path="/register"
          appearance={{
            elements: {
              rootBox: 'mx-auto',
            },
          }}
        />
      </div>
    </div>
  )
}
