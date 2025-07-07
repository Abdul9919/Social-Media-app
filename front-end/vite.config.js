import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
    server: {
    host: true, // allow external access (e.g., via IP or Ngrok)
    port: 5173,
    allowedHosts: ['.ngrok-free.app', 'unknown-contrast-flat-karl.trycloudflare.com']
  }
})
