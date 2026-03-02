import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { signInWithOtp, user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const email = sessionStorage.getItem('byx_auth_email');

  // If user arrives here already authenticated (e.g. magic link opened in same tab)
  useEffect(() => {
    if (!authLoading && user) {
      if (profile?.onboarding_completo) {
        navigate('/app', { replace: true });
      } else {
        navigate('/auth/complete-profile', { replace: true });
      }
    }
  }, [user, profile, authLoading, navigate]);

  useEffect(() => {
    if (!email && !authLoading && !user) {
      navigate('/auth/login', { replace: true });
    }
  }, [email, navigate, authLoading, user]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResendLoading(true);

    try {
      const { error: sendError } = await signInWithOtp(email);

      if (sendError) {
        throw sendError;
      }

      setCountdown(60);
      toast({
        title: 'Email reenviado',
        description: 'Verifique sua caixa de entrada.',
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao reenviar',
        description: err.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setResendLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '';

  if (authLoading) {
    return (
      <AuthLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/auth/login')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 px-6 pb-8 flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Mail className="h-10 w-10 text-primary" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Verifique seu email
            </h1>
            <p className="text-muted-foreground">
              Enviamos um link de acesso para{' '}
              <span className="font-medium text-foreground block mt-1">
                {maskedEmail}
              </span>
            </p>
          </div>

          <div className="bg-muted/50 rounded-2xl p-6 mb-8 max-w-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Como acessar:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Abra seu email</li>
                  <li>Clique no link "Confirmar email"</li>
                  <li>Você será redirecionado automaticamente</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Não recebeu o email?
            </p>
            <Button
              variant="link"
              onClick={handleResend}
              disabled={countdown > 0 || resendLoading}
              className="text-primary"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reenviando...
                </>
              ) : countdown > 0 ? (
                `Reenviar em ${countdown}s`
              ) : (
                'Reenviar email'
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Verifique também a pasta de spam ou lixo eletrônico
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
