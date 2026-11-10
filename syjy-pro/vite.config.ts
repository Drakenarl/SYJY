import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Quatre pages, quatre entrées : une page ne charge jamais le code des autres,
// et chacune garde son adresse d'origine (index, collection, about, contact).
const page = (nom: string) => fileURLToPath(new URL(`./${nom}.html`, import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2018',
    rollupOptions: {
      input: { index: page('index'), collection: page('collection'), about: page('about'), contact: page('contact') },
    },
  },
  server: { port: 5190, host: true },
})
