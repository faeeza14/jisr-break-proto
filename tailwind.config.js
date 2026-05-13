/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // Colors aligned to real Wasl DS values (Figma file dENVT3cpolQRwvDxU35Jvs)
      colors: {
        app: {
          bg: '#F3F3F8',         // page bg (real DS)
          'bg-dark': '#0E0E0F',
          card: '#FFFFFF',
          'card-dark': '#161618',
          surface: '#F9F9FC',    // subdued surface (info card bg in DS)
          ink: '#101014',         // primary text (real DS)
          'ink-dark': '#F2F2F2',
          mute: '#45454D',        // secondary text (real DS)
          'mute-dark': '#9C9FA6',
          faint: '#6B6B75',       // tertiary text (real DS)
          'faint-dark': '#6E7079',
          line: 'rgba(0,0,0,0.12)',     // hairline (DS spec ~0.2 but softened for hairline width)
          'line-dark': 'rgba(255,255,255,0.12)',
          subtle: '#E8E8F0',      // background tint (real DS canvas-rest)
          'subtle-dark': '#1E1E22',
        },
        danger: {
          bg: '#FEE4E2',          // real DS
          'bg-dark': '#3A1A18',
          ink: '#D92C20',         // real DS
          'ink-dark': '#FCA89C',
          line: '#F04437',
        },
        warn: {
          bg: '#FDD890',          // real DS
          'bg-dark': '#3A2C0E',
          ink: '#D7991F',         // real DS
          'ink-dark': '#F4C76A',
          line: '#FCB222',
        },
        ok: {
          bg: '#D1FADF',          // real DS
          'bg-dark': '#10301A',
          ink: '#027A48',         // real DS
          'ink-dark': '#7BD49C',
          line: '#039754',
        },
        info: {
          bg: '#DEEAF8',
          'bg-dark': '#102742',
          ink: '#1F4F8E',
          'ink-dark': '#86B4EC',
        },
      },
      fontFamily: {
        sans: ['Onest', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
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
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
    },
  },
  plugins: [],
}
