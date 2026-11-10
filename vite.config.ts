import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // Vite transforme nativement TSX avec esbuild. Ne pas charger plugin-react
  // évite une dépendance Babel inutile dans les installations locales/offline.
  plugins: [tailwindcss()],
  server: {
    proxy: { '/api': 'http://127.0.0.1:8000' },
  },
  resolve: {
    // Important en environnement local : les dépendances peuvent provenir de
    // liens symboliques, mais l'application doit partager une seule instance.
    dedupe: ['react', 'react-dom'],
    preserveSymlinks: true,
  },
})
