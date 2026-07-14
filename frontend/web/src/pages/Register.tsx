import { SignUp } from '@clerk/clerk-react'

const registerAppearance = {
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

export default function Register() {
  return (
    <div className="min-h-screen bg-[#F4F6F7] flex items-center justify-center">
      <div className="w-full max-w-md">
        <img src="/logo.svg" alt="M3Motors" className="h-10 mx-auto mb-6" />
        <SignUp
          routing="path"
          path="/register"
          afterSignUpUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
          appearance={registerAppearance}
        />
      </div>
    </div>
  )
}
