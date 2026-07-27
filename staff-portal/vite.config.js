import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const FRAPPE_URL = process.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const SITE_NAME = process.env.VITE_SITE_NAME || "edu.localhost";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5173,
    proxy: {
      "/api": {
        target: FRAPPE_URL,
        changeOrigin: true,
        headers: { "X-Frappe-Site-Name": SITE_NAME },
      },
      "/files": {
        target: FRAPPE_URL,
        changeOrigin: true,
        headers: { "X-Frappe-Site-Name": SITE_NAME },
      },
      "/private": {
        target: FRAPPE_URL,
        changeOrigin: true,
        headers: { "X-Frappe-Site-Name": SITE_NAME },
      },
      "/assets": {
        target: FRAPPE_URL,
        changeOrigin: true,
        headers: { "X-Frappe-Site-Name": SITE_NAME },
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          icons: ["lucide-react"],
          radix: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-collapsible",
          ],
        },
      },
    },
  },
});
