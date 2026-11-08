import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    // Pré-carrega as bibliotecas das páginas para o primeiro "npm run dev" não recarregar no meio.
    include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', 'recharts', 'lucide-react', '@dnd-kit/core', 'papaparse'],
  },
})
