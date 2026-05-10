import type { Config } from 'tailwindcss';

export default {
  content: [
    './packages/frontend/**/*.{js,ts,jsx,tsx}',
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
        text: {
          primary: '#1a1a1a',
          secondary: '#666666',
        },
        success: '#2e7d32',
        warning: '#ed6c02',
        error: '#d32f2f',
        // M3 Baseline Colors
        'm3-primary': '#6750A4',
        'm3-primary-container': '#EADDFF',
        'm3-secondary-container': '#E8DEF8',
        'm3-on-primary-container': '#21005D',
        'm3-on-surface': '#1C1B1F',
        'm3-on-surface-variant': '#49454F',
        'm3-outline': '#79747E',
        'm3-surface': '#FFFBFE',
        'm3-surface-variant': '#F3EDF7',
        'm3-surface-container': '#E8DEF8',
        'm3-outline-variant': '#CAC4D0',
        'm3-shadow': '#E6E0E9',
      },
      fontFamily: {
        sans: ['Google Sans', 'Roboto', 'Inter', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['2rem', { lineHeight: '1.25', fontWeight: '600' }],
        h3: ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        h5: ['1.25rem', { lineHeight: '1.4', fontWeight: '500' }],
        h6: ['1rem', { lineHeight: '1.5', fontWeight: '500' }],
        body1: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],
        body2: ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
        caption: ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px',
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '16px',
        input: '8px',
        '3xl': '24px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.08)',
        button: '0 2px 8px rgba(21, 101, 192, 0.2)',
        'button-hover': '0 4px 12px rgba(21, 101, 192, 0.3)',
        'glass-card': '0 8px 32px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-card': '16px',
      },
    },
  },
  plugins: [],
} satisfies Config;