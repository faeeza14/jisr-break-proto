import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// On GitHub Pages the site is served from /jisr-break-proto/. In dev it stays at /.
const isCI = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [react()],
  base: isCI ? '/jisr-break-proto/' : '/',
  resolve: {
    alias: {
      // Shim @jisr-hr/ds-web → local DS mocks that mirror the real package API.
      // When the real package is available, remove this alias and install @jisr-hr/ds-web.
      '@jisr-hr/ds-web': resolve(__dirname, 'src/ds/index.ts'),
    },
  },
})
