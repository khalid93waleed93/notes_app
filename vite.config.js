import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/notes_app/' : '/',
  server: { host: true, port: 5173 },
  build: { outDir: 'dist' },
})
