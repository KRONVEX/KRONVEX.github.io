import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base defaults to '/' for root GitHub Pages (https://kronvex.github.io) and custom domains.
// Override via VITE_BASE_PATH='/repo-name/' if ever deployed under a project subpath.
const base = process.env.VITE_BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
