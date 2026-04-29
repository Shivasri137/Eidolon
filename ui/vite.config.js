import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['aframe'],
  },
  build: {
    commonjsOptions: { transformMixedEsModules: true },
  },
  server: {
    port: 5173,
  },
})
