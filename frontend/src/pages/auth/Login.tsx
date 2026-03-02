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

interface PanelData {
  headline: string;
  sub: string;
  bullets: { icon: typeof Shield; text: string }[];
}

const panelContent: Record<Mode, PanelData> = {
  signin: {
    headline: 'Bem-vindo à Buynnex',
    sub: 'Compre e venda com pagamentos locais e AIOS — simples e seguro.',
    bullets: [
      { icon: Shield, text: 'Compra protegida com escrow' },
      { icon: CreditCard, text: 'Pagamentos: Pix, Cartão, Boleto + AIOS' },
      { icon: MessageCircle, text: 'Chat direto com vendedores' },
    ],
  },
  signup: {
    headline: 'Crie sua conta em 1 minuto',
    sub: 'Anuncie rápido, venda com segurança e acompanhe tudo no pós-venda.',
    bullets: [
      { icon: ShoppingBag, text: 'Anuncie com wizard guiado' },
      { icon: PackageCheck, text: 'Pós-venda com rastreio e devolução' },
      { icon: Store, text: 'Sua loja pronta em poucos passos' },
    ],
  },
};

let signinImg: string | undefined;
let signupImg: string | undefined;
try { signinImg = new URL('@/assets/auth/signin-panel.jpg', import.meta.url).href; } catch { /* fallback */ }
try { signupImg = new URL('@/assets/auth/signup-panel.jpg', import.meta.url).href; } catch { /* fallback */ }

const panelImages: Record<Mode, string | undefined> = {
  signin: signinImg,
  signup: signupImg,
};

const DURATION = 0.4;

const bannerVariants = {
  enter: (dir: number) => ({ opacity: 0, y: dir * 30 }),
  center: { opacity: 1, y: 0 },
  exit: (dir: number) => ({ opacity: 0, y: dir * -30 }),
};

const formVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const transition = reducedMotion
  ? { duration: 0.15, ease: 'easeOut' as const }
  : { duration: DURATION, ease: [0.4, 0, 0.2, 1] as const };

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
  const [imgFailed, setImgFailed] = useState<Record<Mode, boolean>>({ signin: false, signup: false });

  useEffect(() => { setSeenBefore(localStorage.getItem(SEEN_KEY) === 'true'); }, []);

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

  const resetEmail = useCallback(() => { setStage('input'); setEmail(''); setError(''); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) { setError(result.error.errors[0].message); return; }
    setLoading(true);
    try {
      const { error: signInError } = await signInWithOtp(email.trim());
      if (signInError) throw signInError;
      sessionStorage.setItem('byx_auth_email', email.trim());
      setStage('sent');
      setResendTimer(RESEND_SECONDS);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Erro ao enviar código', description: err.message || 'Tente novamente mais tarde.' });
    } finally { setLoading(false); }
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
    } finally { setLoading(false); }
  };

  const panel = panelContent[mode];
  const currentImg = panelImages[mode];
  const showImg = currentImg && !imgFailed[mode];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <div className="relative lg:w-1/2 lg:min-h-screen overflow-hidden">
        <AnimatePresence mode="wait">
          {showImg && (
            <motion.img
              key={`img-${mode}`}
              src={currentImg}
              alt=""
              aria-hidden
              onError={() => setImgFailed((p) => ({ ...p, [mode]: true }))}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/75 to-primary/85" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-white/[0.06] rounded-full" />
        <div className="absolute top-[10%] -left-12 w-48 h-48 bg-white/[0.04] rounded-full" />

        <div className="relative z-10 flex items-center justify-center h-full px-8 py-12 lg:px-14 xl:px-20 min-h-[240px] lg:min-h-screen">
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={mode}
                custom={direction}
                variants={reducedMotion ? undefined : bannerVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <span className="inline-block text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-4 lg:mb-6">Buynnex</span>
                <h1 className="text-2xl lg:text-4xl xl:text-[2.75rem] font-bold text-white leading-tight mb-3">{panel.headline}</h1>
                <p className="text-sm lg:text-base text-white/75 leading-relaxed mb-8 lg:mb-10 max-w-md">{panel.sub}</p>
                <div className="space-y-4 hidden lg:block">
                  {panel.bullets.map((b, i) => (
                    <motion.div key={b.text} initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 + i * 0.08, duration: 0.35 }} className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-white/[0.12] backdrop-blur-sm flex items-center justify-center shrink-0">
                        <b.icon className="h-[18px] w-[18px] text-white/90" />
                      </div>
                      <span className="text-[15px] text-white/85 font-medium">{b.text}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-10 lg:px-10 xl:px-16 lg:min-h-screen">
        <div className="w-full max-w-md">
          <div className="flex rounded-xl bg-muted p-1 mb-8" role="tablist">
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button key={m} role="tab" aria-selected={mode === m} tabIndex={0} onClick={() => switchMode(m)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); switchMode(m); } }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >{m === 'signin' ? 'Entrar' : 'Criar conta'}</button>
            ))}
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={`${mode}-${stage}`} custom={direction} variants={reducedMotion ? undefined : formVariants} initial="enter" animate="center" exit="exit" transition={transition}>
              {stage === 'input' ? (
                <>
                  <div className="mb-6">
                    <h2 className="text-xl lg:text-2xl font-bold text-foreground">{mode === 'signin' ? seenBefore ? 'Bem-vindo de volta' : 'Entre na sua conta' : 'Crie sua conta'}</h2>
                    <p className="text-muted-foreground text-sm mt-1.5">{mode === 'signin' ? 'Insira seu email para receber um link de acesso' : 'Basta um email para começar — rápido e seguro'}</p>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="auth-email" className="text-sm font-medium">Endereço de email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-muted-foreground pointer-events-none" />
                        <Input id="auth-email" type="email" placeholder="seu@email.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          className={`pl-11 h-11 min-h-[44px] rounded-xl text-base ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`} autoComplete="email" autoFocus maxLength={254} />
                      </div>
                      {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <Button type="submit" disabled={loading || !email.trim()} className="w-full h-11 min-h-[44px] rounded-xl text-base font-semibold" size="lg">
                      {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enviando...</> : <>Continuar <ArrowRight className="ml-2 h-5 w-5" /></>}
                    </Button>
                  </form>
                  <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
                    Ao continuar, você concorda com nossos{' '}<Link to="/legal/terms" className="text-primary hover:underline font-medium">Termos de Uso</Link>{' '}e{' '}<Link to="/legal/privacy" className="text-primary hover:underline font-medium">Política de Privacidade</Link>.
                  </p>
                  <div className="mt-6 pt-5 border-t border-border text-center space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {mode === 'signin' ? (<>Não tem uma conta?{' '}<button onClick={() => switchMode('signup')} className="text-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Criar conta</button></>) : (<>Já tem uma conta?{' '}<button onClick={() => switchMode('signin')} className="text-primary font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Entrar</button></>)}
                    </p>
                    {mode === 'signin' && seenBefore && (
                      <button onClick={() => { localStorage.removeItem(SEEN_KEY); setSeenBefore(false); setEmail(''); }} className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded">Entrar com outro email</button>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-5"><Mail className="h-8 w-8 text-primary" /></div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Verifique seu email</h2>
                  <p className="text-muted-foreground text-sm mb-1">Enviamos um link de acesso para</p>
                  <p className="font-semibold text-foreground mb-6">{email}</p>
                  <div className="space-y-3">
                    <Button variant="outline" onClick={handleResend} disabled={loading || resendTimer > 0} className="w-full h-11 min-h-[44px] rounded-xl">
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                      {resendTimer > 0 ? `Reenviar em ${resendTimer}s` : 'Reenviar link'}
                    </Button>
                    <Button variant="ghost" onClick={resetEmail} className="w-full h-11 min-h-[44px] rounded-xl text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Trocar email</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="lg:hidden mt-8 pt-6 border-t border-border">
            <div className="grid grid-cols-3 gap-3 text-center">
              {panel.bullets.map((b) => (
                <div key={b.text} className="space-y-1.5">
                  <div className="h-10 w-10 mx-auto rounded-xl bg-primary/10 flex items-center justify-center"><b.icon className="h-5 w-5 text-primary" /></div>
                  <p className="text-[11px] leading-tight text-muted-foreground">{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
