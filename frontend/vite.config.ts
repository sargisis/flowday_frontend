import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle visualizer (run `npm run build` then open stats.html)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // PWA plugin
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'Flowday - Flow State OS',
        short_name: 'Flowday',
        description: 'The Operating System for Deep Work. Manage your attention, not just your tasks.',
        theme_color: '#6366f1',
        background_color: '#09090b',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'Open dashboard',
            url: '/app/v1/dashboard',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'Focus Mode',
            short_name: 'Focus',
            description: 'Start focus session',
            url: '/app/v1/focus',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
        categories: ['productivity', 'business', 'utilities'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // ✅ SPA: Don't cache navigation requests (let router handle them)
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/_/, /\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2)$/],
        // ✅ PERFORMANCE: Skip waiting and claim clients for immediate updates
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5, // 5 minutes
              },
              networkTimeoutSeconds: 10,
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable PWA in dev mode (enable if you want to test)
        type: 'module',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Production optimizations
  build: {
    // Disable source maps for smaller builds (enable for debugging if needed)
    sourcemap: false,
    // Chunk size warnings threshold (in KB)
    chunkSizeWarningLimit: 1000,
    // Rollup options for code splitting and optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and parallel loading
        manualChunks: (id) => {
          // React and core dependencies
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // TanStack Query (React Query)
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query-vendor';
          }
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/sonner')) {
            return 'ui-vendor';
          }
          // Heavy UI libraries (loaded on demand)
          if (id.includes('node_modules/canvas-confetti') || id.includes('node_modules/react-markdown')) {
            return 'ui-heavy';
          }
          // Utility libraries
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns') || id.includes('node_modules/zod')) {
            return 'utils-vendor';
          }
          // DnD Kit for kanban (loaded when needed)
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd-vendor';
          }
          // Sentry (error tracking - loaded on demand)
          if (id.includes('node_modules/@sentry')) {
            return 'monitoring-vendor';
          }
          // Other vendor code
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Feature-based chunks for better code splitting
          if (id.includes('/components/kanban/')) {
            return 'kanban';
          }
          if (id.includes('/components/ai/')) {
            return 'ai';
          }
          if (id.includes('/pages/')) {
            // Pages are already lazy loaded, but we can group them
            if (id.includes('Dashboard') || id.includes('TasksPage') || id.includes('Calendar')) {
              return 'core-pages';
            }
            if (id.includes('FocusMode') || id.includes('FocusHistory')) {
              return 'focus-pages';
            }
          }
        },
        // Optimize chunk file names for better caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Minification (terser is default, but we can optimize further)
    minify: 'esbuild', // Faster than terser, good compression
    // Target modern browsers for better optimization
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Development server configuration
  server: {
    port: 5173,
    host: true,
    // ✅ SPA: Vite automatically handles history API fallback for SPA routing
    // ✅ CORS: Allow cross-origin requests in development
    cors: true,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
    // ✅ SPA: Vite automatically handles history API fallback for SPA routing
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'date-fns'],
  },
})
