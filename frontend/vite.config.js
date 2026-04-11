import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Suppress the chunk size warning threshold (Vercel has no issues with larger bundles)
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libraries into separate cacheable chunks
          vendor: ["react", "react-dom", "react-router-dom"],
          ui: [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled",
          ],
          charts: ["recharts", "chart.js"],
          maps: ["leaflet", "react-leaflet"],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.VITE_DEV_BACKEND_URL || 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
