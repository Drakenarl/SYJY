import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Quatre pages, quatre entrées : une page ne charge jamais le code des autres,
// et chacune garde son adresse d'origine (index, collection, about, contact).
// Les chemins sont relatifs à la racine du projet, que Vite résout lui-même.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2018',
    rollupOptions: {
      input: {
        index: 'index.html',
        collection: 'collection.html',
        about: 'about.html',
        contact: 'contact.html',
      },
    },
  },
  server: { port: 5190, host: true },
})
