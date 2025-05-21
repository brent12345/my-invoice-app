// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
  server: {
    proxy: {
      // any request to /functions/<slug> → https://<project>.functions.supabase.co/<slug>
      '^/functions/.*': {
        target: 'https://agrzzbpqibouaulrmnzz.functions.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/functions/, ''),
      },
    },
  },
})
