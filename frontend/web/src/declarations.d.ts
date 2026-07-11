declare module 'react-google-recaptcha' {
  import { Component } from 'react'
  interface ReCAPTCHAProps {
    sitekey: string
    onChange?: (token: string | null) => void
    onExpired?: () => void
    onErrored?: () => void
    theme?: 'light' | 'dark'
    size?: 'normal' | 'compact'
    tabindex?: number
    badge?: 'bottomright' | 'bottomleft' | 'inline'
  }
  export default class ReCAPTCHA extends Component<ReCAPTCHAProps> {
    reset(): void
  }
}
