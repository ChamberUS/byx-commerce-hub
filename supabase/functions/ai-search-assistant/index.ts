import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, categories } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é o assistente de busca inteligente da Buynnex, um marketplace global.
Seu objetivo é ajudar o usuário a encontrar o produto ideal fazendo perguntas estratégicas.

Regras:
- Responda SEMPRE em português brasileiro
- Seja conciso e amigável (máximo 2-3 frases por resposta)
- Faça perguntas objetivas sobre: categoria, uso pretendido, faixa de preço, condição (novo/usado), marca preferida
- Após coletar informações suficientes (2-3 perguntas), sugira termos de busca específicos
- Quando tiver informações suficientes, responda com um JSON no formato:
  {"suggestion": true, "searchQuery": "termo de busca", "filters": {"condition": "new|used", "min_price": 0, "max_price": 1000}}
- Se o usuário ainda não deu informações suficientes, responda normalmente com uma pergunta
- Categorias disponíveis: ${categories || 'Eletrônicos, Moda, Casa, Esportes, Beleza, Games, Livros, Veículos'}

Exemplo de fluxo:
User: "Quero comprar um notebook"
Assistente: "Ótimo! Para que vai usar? Trabalho, estudos ou games? E tem uma faixa de preço em mente?"
User: "Para trabalho, até 5000"
Assistente: {"suggestion": true, "searchQuery": "notebook trabalho profissional", "filters": {"max_price": 5000, "condition": "new"}}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Muitas requisições, tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro no serviço de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
