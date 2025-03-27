// vite.config.js
export default {
  // Basic server configuration
  server: {
    port: 5173,
    open: true, // Automatically open browser
  },

  // Build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Minification for production
    minify: 'terser',
  },

  // Development optimizations
  optimizeDeps: {
    include: [],
  },
}
