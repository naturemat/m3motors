import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!clerkPubKey) {
  document.getElementById('root')!.innerHTML = `
    <div style="padding:40px;text-align:center;font-family:system-ui">
      <h1>Configuration Error</h1>
      <p>VITE_CLERK_PUBLISHABLE_KEY is not set.</p>
      <p>Set it in your .env file or as a Docker build arg.</p>
    </div>
  `
  throw new Error('VITE_CLERK_PUBLISHABLE_KEY is not set')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>,
)
