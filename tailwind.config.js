import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565c0',
          light: '#1976d2',
          dark: '#0d47a1',
        },
        secondary: {
          DEFAULT: '#7b1fa2',
          light: '#9c27b0',
          dark: '#6a1b9a',
        },
        background: {
          default: '#f8fafc',
          paper: '#ffffff',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '12px',
        card: '16px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        button: '0 2px 8px rgba(21, 101, 192, 0.2)',
        'button-hover': '0 4px 12px rgba(21, 101, 192, 0.3)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-card': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;