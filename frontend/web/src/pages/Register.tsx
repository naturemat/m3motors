import { SignUp } from '@clerk/clerk-react'

export default function Register() {
  return (
    <div className="min-h-screen bg-neutralBg flex items-center justify-center">
      <div className="w-full max-w-md">
        <img src="/logo.svg" alt="M3Motors" className="h-10 mx-auto mb-6" />
        <SignUp
          routing="path"
          path="/register"
          afterSignUpUrl="/dashboard"
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
