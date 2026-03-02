import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const timeout = setTimeout(() => {
      if (isMounted) {
        setTimedOut(true);
        setError('O processo de autenticação demorou muito. Tente novamente.');
      }
    }, 8000);

    const handleCallback = async () => {
      try {
        // The Supabase client with detectSessionInUrl: true will automatically
        // pick up tokens from the URL hash/query params
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // Try exchanging code if present
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');
          
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) throw exchangeError;
          }

          // Re-check session after exchange
          const { data: { session: newSession } } = await supabase.auth.getSession();
          
          if (!newSession) {
            // Wait briefly for onAuthStateChange to fire
            await new Promise(resolve => setTimeout(resolve, 1500));
            const { data: { session: finalSession } } = await supabase.auth.getSession();
            
            if (!finalSession) {
              throw new Error('Não foi possível estabelecer a sessão.');
            }
          }
        }

        if (!isMounted) return;
        clearTimeout(timeout);

        // Session established - check profile for redirect
        const { data: { session: confirmedSession } } = await supabase.auth.getSession();
        
        if (confirmedSession?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completo')
            .eq('id', confirmedSession.user.id)
            .single();

          if (profile?.onboarding_completo) {
            navigate('/app', { replace: true });
          } else {
            navigate('/auth/complete-profile', { replace: true });
          }
        } else {
          navigate('/app', { replace: true });
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('[AuthCallback] Error:', err);
          setError(err.message || 'Erro ao autenticar. Tente novamente.');
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

  if (error || timedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Erro na autenticação</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => window.location.reload()} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
            <Button variant="outline" onClick={() => navigate('/auth/login', { replace: true })} className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar ao login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Autenticando...</p>
    </div>
  );
}
