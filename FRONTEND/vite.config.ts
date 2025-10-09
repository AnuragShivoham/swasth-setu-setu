import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // ✅ Base URL for GitHub Pages
  base: "/swasth-setu-setu/",

  // ✅ Dev server configuration
  server: {
    host: "::", // listen on all network interfaces
    port: 8080, // optional, can be changed
  },

  // ✅ Plugins
  plugins: [
    react(),
  ],

  // ✅ Path aliases
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
