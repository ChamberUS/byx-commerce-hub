import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Send, X, Sparkles, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

type Msg = { role: 'user' | 'assistant'; content: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-search-assistant`;

export function AISearchAssistant() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-show after 3 seconds on search page
  useEffect(() => {
    if (!hasShown) {
      const timer = setTimeout(() => {
        setHasShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasShown]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSuggestion = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      if (parsed.suggestion && parsed.searchQuery) {
        const params = new URLSearchParams();
        params.set('q', parsed.searchQuery);
        if (parsed.filters?.condition) params.set('condition', parsed.filters.condition);
        if (parsed.filters?.min_price) params.set('min', String(parsed.filters.min_price));
        if (parsed.filters?.max_price) params.set('max', String(parsed.filters.max_price));
        navigate(`/app/search?${params.toString()}`);
        setOpen(false);
        return true;
      }
    } catch {
      // Not JSON, normal message
    }
    return false;
  };

  const send = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: Msg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error('Failed to connect');
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Check if final message is a suggestion
      if (assistantSoFar) {
        handleSuggestion(assistantSoFar);
      }
    } catch (err) {
      console.error('AI Search error:', err);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Desculpe, ocorreu um erro. Tente novamente.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Parse assistant message - if it's a JSON suggestion, render nicely
  const renderMessage = (msg: Msg) => {
    if (msg.role === 'assistant') {
      try {
        const parsed = JSON.parse(msg.content);
        if (parsed.suggestion && parsed.searchQuery) {
          return (
            <div className="space-y-2">
              <p className="text-sm">Encontrei o que você precisa! 🎯</p>
              <Button
                size="sm"
                className="w-full rounded-xl"
                onClick={() => {
                  const params = new URLSearchParams();
                  params.set('q', parsed.searchQuery);
                  if (parsed.filters?.condition) params.set('condition', parsed.filters.condition);
                  if (parsed.filters?.min_price) params.set('min', String(parsed.filters.min_price));
                  if (parsed.filters?.max_price) params.set('max', String(parsed.filters.max_price));
                  navigate(`/app/search?${params.toString()}`);
                  setOpen(false);
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Buscar: "{parsed.searchQuery}"
              </Button>
            </div>
          );
        }
      } catch {
        // Normal text
      }
    }
    return <p className="text-sm whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-20 right-4 z-50 md:bottom-6"
          >
            <Button
              onClick={() => {
                setOpen(true);
                if (messages.length === 0) {
                  setMessages([{
                    role: 'assistant',
                    content: 'Olá! 👋 Posso te ajudar a encontrar o produto ideal. O que você está procurando?'
                  }]);
                }
              }}
              className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              size="icon"
            >
              <Bot className="h-6 w-6" />
            </Button>
            {hasShown && messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-16 right-0 bg-card border rounded-xl p-3 shadow-lg w-56"
              >
                <p className="text-xs text-muted-foreground">
                  💡 Precisa de ajuda para encontrar o produto ideal?
                </p>
                <button
                  onClick={() => setOpen(true)}
                  className="text-xs text-primary font-medium mt-1"
                >
                  Falar com IA →
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-20 right-4 z-50 w-80 md:w-96 md:bottom-6 bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ maxHeight: 'min(500px, 70vh)' }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b bg-primary/5">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">Busca Inteligente</p>
                <p className="text-xs text-muted-foreground">Powered by Buynnex AI</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setOpen(false)}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ minHeight: 200 }}>
              {messages.map((msg, i) => (
                <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[85%] rounded-2xl px-3 py-2',
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}>
                    {renderMessage(msg)}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t p-3">
              <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ex: notebook para trabalho..."
                  className="rounded-xl text-sm h-9"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" className="h-9 w-9 rounded-xl flex-shrink-0" disabled={!input.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
