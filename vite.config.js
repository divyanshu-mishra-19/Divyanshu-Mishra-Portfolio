import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ command }) => {
  const plugins = [react(), tailwindcss()];

  // Only load the local API backend plugin during interactive dev server (vite)
  // This isolates the production frontend build (vite build) from server and SQLite dependencies
  if (command === 'serve') {
    const { viteApiPlugin } = await import('./server/vitePluginApi.js');
    plugins.push(viteApiPlugin());
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('node_modules/framer-motion/')) {
              return 'vendor-motion';
            }
            if (id.includes('node_modules/lucide-react/')) {
              return 'vendor-icons';
            }
          }
        }
      },
      chunkSizeWarningLimit: 600,
    }
  };
});
