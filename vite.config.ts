import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 4180,
  },
  plugins: [vue(), UnoCSS()],
})
