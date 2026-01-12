import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

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
  ],
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
          // UI libraries
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/sonner') || id.includes('node_modules/canvas-confetti')) {
            return 'ui-vendor';
          }
          // Utility libraries
          if (id.includes('node_modules/axios') || id.includes('node_modules/date-fns') || id.includes('node_modules/zod')) {
            return 'utils-vendor';
          }
          // DnD Kit for kanban
          if (id.includes('node_modules/@dnd-kit')) {
            return 'dnd-vendor';
          }
          // Other vendor code
          if (id.includes('node_modules')) {
            return 'vendor';
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
  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'date-fns'],
  },
})
