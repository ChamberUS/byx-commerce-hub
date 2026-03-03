import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    // Fallbacks for when .env is not loaded (publishable/anon keys only)
    ...(process.env.VITE_SUPABASE_URL ? {} : {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify("https://svifufdyulsvcuwrmifm.supabase.co"),
    }),
    ...(process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? {} : {
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN2aWZ1ZmR5dWxzdmN1d3JtaWZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzODQzNTUsImV4cCI6MjA4Mzk2MDM1NX0.rplaUXPNJjtXstxqlTnnYxI30Gz5eSmzX-RfdK8v1-Q"),
    }),
  },
}));
