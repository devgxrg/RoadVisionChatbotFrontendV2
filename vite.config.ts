import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3001,
    middlewareMode: false,
    allowedHosts: [".ngrok-free.app", ".lhr.life", "ceigall.roadvision.ai"],
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => {
          // Rewrite /api/* to /api/v1/* (but not /api/v1/* to /api/v1/v1/*)
          if (path.startsWith("/api/v1")) {
            return path; // Already has /v1, don't rewrite
          }
          return path.replace(/^\/api/, "/api/v1");
        },
      },
      "/docs": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/docs/, "/docs"),
      },
      "/pgadmin": {
        target: "http://localhost:5050",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/pgadmin/, ""),
      }
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
