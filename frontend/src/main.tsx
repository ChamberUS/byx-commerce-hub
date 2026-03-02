import { createRoot } from "react-dom/client";
import { supabaseConfigured } from "@/integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

if (!supabaseConfigured) {
  createRoot(document.getElementById("root")!).render(
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚙️ Configuração necessária</h1>
      <p style={{ color: '#666', maxWidth: '400px' }}>As variáveis de ambiente do Supabase (<code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>) não estão definidas. Configure o ambiente e recarregue.</p>
    </div>
  );
} else {
  createRoot(document.getElementById("root")!).render(<App />);
}
