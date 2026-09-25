import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  optimizeDeps: { exclude: ["framer-motion", "motion-dom"] },
  build: {
    rollupOptions: { output: { manualChunks: { motion: ["framer-motion"] } } },
  },
});
