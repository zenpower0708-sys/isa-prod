import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        viewer: resolve(__dirname, 'viewer.html'),
        checkout: resolve(__dirname, 'checkout.html'),
        discipline: resolve(__dirname, 'discipline.html'),
      },
    },
  },
})
