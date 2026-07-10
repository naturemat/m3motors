/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A5276',
          50: '#EBF5FB',
          100: '#EBF5FB',
          600: '#154360',
          700: '#0E3B4F',
        },
        secondary: {
          DEFAULT: '#2E86C1',
          100: '#D6EAF8',
          600: '#2471A3',
        },
        tertiary: '#3498DB',
        success: {
          DEFAULT: '#27AE60',
          100: '#D5F5E3',
        },
        error: {
          DEFAULT: '#E74C3C',
          100: '#FDEDEC',
        },
        warning: {
          DEFAULT: '#F39C12',
          100: '#FEF9E7',
        },
        info: {
          DEFAULT: '#3498DB',
          100: '#EBF5FB',
        },
        neutral: {
          900: '#2C3E50',
          800: '#34495E',
          600: '#5D6D7E',
          400: '#95A5A6',
          300: '#BDC3C7',
          200: '#E2E8F0',
          100: '#F4F6F7',
          0: '#FFFFFF',
        },
        neutralBg: '#F4F6F7',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'none': '0px',
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        'full': '9999px',
      },
      boxShadow: {
        'xs': '0 1px 2px rgba(0,0,0,0.05)',
        'sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'md': '0 4px 12px rgba(0,0,0,0.08)',
        'lg': '0 10px 25px rgba(0,0,0,0.10)',
        'xl': '0 20px 50px rgba(0,0,0,0.12)',
        'inner': 'inset 0 2px 4px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [],
}
