import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// On GitHub Pages the site is served from /jisr-break-proto/. In dev it stays at /.
const isCI = process.env.GITHUB_ACTIONS === 'true'

export default defineConfig({
  plugins: [react()],
  base: isCI ? '/jisr-break-proto/' : '/',
})
