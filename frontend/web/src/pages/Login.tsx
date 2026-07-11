import { SignIn } from '@clerk/clerk-react'

export default function Login() {
  return (
    <div className="min-h-screen bg-neutralBg flex items-center justify-center">
      <div className="w-full max-w-md">
        <img src="/logo.svg" alt="M3Motors" className="h-10 mx-auto mb-6" />
        <SignIn
          routing="path"
          path="/login"
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
