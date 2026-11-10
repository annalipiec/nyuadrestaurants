import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      // server/ (Express API) must be running separately on :4000 — see CLAUDE.md.
      '/api': 'http://localhost:4000',
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'favicon.png'],
      manifest: {
        name: 'NYUAD Eats',
        short_name: 'NYUAD Eats',
        description:
          'Discover affordable restaurants near NYU Abu Dhabi, with shuttle directions, must-try dishes, and community tips.',
        // Matches the light-theme accent-strong token (see src/styles/tokens.css).
        theme_color: '#681f98',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        // Lets the service worker be exercised with `npm run dev` too, not just previews/builds.
        enabled: true,
      },
    }),
  ],
})
