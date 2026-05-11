/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F9F8F4',
          'bg-dark': '#0E0E0F',
          card: '#FFFFFF',
          'card-dark': '#161618',
          ink: '#0B0B0C',
          'ink-dark': '#F2F2F2',
          mute: '#5C5F66',
          'mute-dark': '#9C9FA6',
          faint: '#8A8D94',
          'faint-dark': '#6E7079',
          line: 'rgba(11,11,12,0.08)',
          'line-dark': 'rgba(255,255,255,0.10)',
          subtle: '#F1EFE9',
          'subtle-dark': '#1E1E22',
        },
        danger: {
          bg: '#FBE9E7',
          'bg-dark': '#3A1A18',
          ink: '#A32314',
          'ink-dark': '#FCA89C',
          line: '#F4B7AE',
        },
        warn: {
          bg: '#FCEFD3',
          'bg-dark': '#3A2C0E',
          ink: '#8A5A00',
          'ink-dark': '#F4C76A',
          line: '#EAC780',
        },
        ok: {
          bg: '#DEF1E2',
          'bg-dark': '#10301A',
          ink: '#16693C',
          'ink-dark': '#7BD49C',
        },
        info: {
          bg: '#DEEAF8',
          'bg-dark': '#102742',
          ink: '#1F4F8E',
          'ink-dark': '#86B4EC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '11': ['11px', { lineHeight: '14px' }],
        '13': ['13px', { lineHeight: '18px' }],
      },
      borderRadius: {
        card: '12px',
      },
      borderWidth: {
        hair: '0.5px',
      },
    },
  },
  plugins: [],
}
