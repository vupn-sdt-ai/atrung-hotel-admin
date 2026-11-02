import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'A Trung Homestay · Quản lý',
        short_name: 'A Trung',
        description:
          'Bảng điều khiển vận hành A Trung Homestay · Quản lý đặt phòng, lễ tân, buồng phòng và doanh thu.',
        theme_color: '#0B5D50',
        background_color: '#FAF8F3',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: './',
        scope: './',
        lang: 'vi',
        categories: ['business', 'productivity', 'travel'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Đặt phòng mới', short_name: 'Đặt phòng', url: './bookings?new=1', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
          { name: 'Lễ tân hôm nay', short_name: 'Lễ tân', url: './front-desk', icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'unsplash', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: true },
})
