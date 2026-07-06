import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { planApiPlugin } from './scripts/vite-plan-api.js'

export default defineConfig({
  plugins: [react(), planApiPlugin()],
  base: './',
  clearScreen: false,
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'build',
  },
})
