import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/noten-app/' : '/',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist' },
})
