import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Mail, Shield, MessageCircle, CreditCard,
  ShoppingBag, Store, PackageCheck, ArrowRight, RefreshCw, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Digite um email válido');

const SEEN_KEY = 'buynnex_seen_login';
const RESEND_SECONDS = 60;

type Mode = 'signin' | 'signup';
type Stage = 'input' | 'sent';

const panelContent: Record<Mode, {
  headline: string;
  sub: string;
  bullets: { icon: typeof Shield; text: string }[];
  image: string;
}> = {
  signin: {
    headline: 'Bem-vindo à Buynnex',
    sub: 'Sua plataforma de comércio inteligente',
    bullets: [
      { icon: Shield, text: 'Compra protegida com escrow' },
      { icon: CreditCard, text: 'Pagamentos locais (Pix/Cartão/Boleto) + AIOS' },
      { icon: MessageCircle, text: 'Chat direto com vendedores' },
    ],
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80',
  },
  signup: {
    headline: 'Crie sua conta em 1 minuto',
    sub: 'Comece a comprar e vender hoje mesmo',
    bullets: [
      { icon: ShoppingBag, text: 'Compre e venda com segurança' },
      { icon: Store, text: 'Sua loja em poucos passos' },
      { icon: PackageCheck, text: 'Acompanhamento do pedido do início ao fim' },
    ],
    image: 'https://images.unsplash.com/photo-1556740758-90de940a6084?w=1200&q=80',
  },
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 24, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -24, opacity: 0 }),
};

export default function Login() {
  const navigate = useNavigate();
  const { signInWithOtp } = useAuth();
  const { toast } = useToast();

  const [mode, setMode] = useState<Mode>('signin');
  const [stage, setStage] = useState<Stage>('input');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1);
  const [resendTimer, setResendTimer] = useState(0);
  const [seenBefore, setSeenBefore] = useState(false);

  useEffect(() => {
    setSeenBefore(localStorage.getItem(SEEN_KEY) === 'true');
  }, []);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const switchMode = useCallback((next: Mode) => {
    if (next === mode) return;
    setDirection(next === 'signup' ? 1 : -1);
    setMode(next);
    setStage('input');
    setError('');
  }, [mode]);

  const resetEmail = useCallback(() => {
    setStage('input');
    setEmail('');
    setError('');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);
    try {
      const { error: signInError } = await signInWithOtp(email.trim());
      if (signInError) throw signInError;

      sessionStorage.setItem('byx_auth_email', email.trim());
      setStage('sent');
      setResendTimer(RESEND_SECONDS);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar código',
        description: err.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const { error: signInError } = await signInWithOtp(email.trim());
      if (signInError) throw signInError;
      setResendTimer(RESEND_SECONDS);
      toast({ title: 'Link reenviado', description: `Verifique ${email}` });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const panel = panelContent[mode];

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${panel.image})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/70 to-primary/90" />
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-16 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <div className="mb-6">
                <span className="text-sm font-semibold tracking-widest uppercase text-white/60">Buynnex</span>
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-3 leading-tight">{panel.headline}</h1>
              <p className="text-lg text-white/80 mb-10 font-light">{panel.sub}</p>
              <div className="space-y-5">
                {panel.bullets.map((b, i) => (
                  <motion.div
                    key={b.text}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                      <b.icon className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-base text-white/90">{b.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
          <div className="mt-auto pt-12">
            <p className="text-white/40 text-xs">© {new Date().getFullYear()} Buynnex · Tecnologia IAOS</p>
          </div>
        </div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-white/5 rounded-full motion-safe:animate-pulse" />
        <div className="absolute -top-20 -right-20 w-56 h-56 bg-white/5 rounded-full" />
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="lg:hidden relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${panel.image})` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-background" />
          <div className="relative z-10 px-6 pt-10 pb-8 text-center">
            <span className="text-xs font-semibold tracking-widest uppercase text-white/60">Buynnex</span>
            <h1 className="text-2xl font-bold text-white mt-2">{panel.headline}</h1>
            <p className="text-sm text-white/70 mt-1">{panel.sub}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-md mx-auto">
            <div className="flex rounded-xl bg-muted p-1 mb-8" role="tablist">
              {(['signin', 'signup'] as Mode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    mode === m
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'signin' ? 'Entrar' : 'Criar conta'}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={`${mode}-${stage}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {stage === 'input' ? (
                  <>
                    <div className="mb-6">
                      <h2 className="text-xl lg:text-2xl font-bold text-foreground">
                        {mode === 'signin'
                          ? seenBefore ? 'Bem-vindo de volta' : 'Entre na sua conta'
                          : 'Crie sua conta'}
                      </h2>
                      <p className="text-muted-foreground text-sm mt-1">
                        {mode === 'signin'
                          ? 'Insira seu email para receber um link de acesso'
                          : 'Basta um email para começar — rápido e seguro'}
                      </p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Endereço de email</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(''); }}
                            className={`pl-12 h-12 rounded-xl text-base ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                            autoComplete="email"
                            autoFocus
                            maxLength={254}
                          />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                      </div>
                      <Button type="submit" disabled={loading || !email.trim()} className="w-full h-12 rounded-xl text-base font-medium" size="lg">
                        {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</> : <>Continuar <ArrowRight className="ml-2 h-5 w-5" /></>}
                      </Button>
                    </form>
                    <p className="text-xs text-muted-foreground text-center mt-4">
                      Ao continuar, você concorda com nossos{' '}
                      <Link to="/legal/terms" className="text-primary hover:underline font-medium">Termos de Uso</Link>{' '}e{' '}
                      <Link to="/legal/privacy" className="text-primary hover:underline font-medium">Política de Privacidade</Link>.
                    </p>
                    <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {mode === 'signin' ? (
                          <>Não tem uma conta?{' '}<button onClick={() => switchMode('signup')} className="text-primary font-medium hover:underline">Criar conta</button></>
                        ) : (
                          <>Já tem uma conta?{' '}<button onClick={() => switchMode('signin')} className="text-primary font-medium hover:underline">Entrar</button></>
                        )}
                      </p>
                      {mode === 'signin' && seenBefore && (
                        <button onClick={() => { localStorage.removeItem(SEEN_KEY); setSeenBefore(false); setEmail(''); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                          Entrar com outro email
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                      <Mail className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Verifique seu email</h2>
                    <p className="text-muted-foreground text-sm mb-1">Enviamos um link de acesso para</p>
                    <p className="font-semibold text-foreground mb-6">{email}</p>
                    <div className="space-y-3">
                      <Button variant="outline" onClick={handleResend} disabled={loading || resendTimer > 0} className="w-full h-11 rounded-xl">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar link'}
                      </Button>
                      <Button variant="ghost" onClick={resetEmail} className="w-full h-11 rounded-xl text-muted-foreground">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Trocar email
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="lg:hidden mt-10 pt-6 border-t border-border">
              <div className="grid grid-cols-3 gap-3 text-center">
                {panel.bullets.map((b) => (
                  <div key={b.text} className="space-y-1.5">
                    <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center">
                      <b.icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-[11px] leading-tight text-muted-foreground">{b.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
