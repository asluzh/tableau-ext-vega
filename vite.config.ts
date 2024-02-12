import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  base: "/tableau-ext-vega/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        config: 'config.html'
      }
    }
  }
})
