import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mandi-connect\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/res\.cloudinary\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Mandi-Connect',
        short_name: 'MandiConnect',
        description: 'Direct Farm-to-Retail Marketplace',
        theme_color: '#4CAF50',
        background_color: '#FFF8E7',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png'
          },
          {
            src: '/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png'
          },
          {
            src: '/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png'
          },
          {
            src: '/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png'
          },
          {
            src: '/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png'
          },
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          animation: ['framer-motion'],
          icons: ['lucide-react']
        }
      }
    }
  }
})   
