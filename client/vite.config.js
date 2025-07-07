import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'https://realtime-collaborative-notes-app.onrender.com',
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: 'https://realtime-collaborative-notes-app.onrender.com',
        ws: true,
        changeOrigin: true,
        secure: true,
      }
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.NODE_ENV === 'production' 
        ? 'https://realtime-collaborative-notes-app.onrender.com' 
        : 'http://localhost:5000'
    ),
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
