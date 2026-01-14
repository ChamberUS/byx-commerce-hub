import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { OTPInput } from '@/components/auth/OTPInput';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { verifyOtp, signInWithOtp } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const email = sessionStorage.getItem('byx_auth_email');

  useEffect(() => {
    if (!email) {
      navigate('/auth/login', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleComplete = async (code: string) => {
    if (!email) return;

    setError(false);
    setLoading(true);

    try {
      const { error: verifyError } = await verifyOtp(email, code);

      if (verifyError) {
        throw verifyError;
      }

      // Check if profile type was selected
      const profileType = sessionStorage.getItem('byx_profile_type');
      if (profileType) {
        sessionStorage.removeItem('byx_profile_type');
        // Profile will be updated in complete-profile
      }

      navigate('/auth/complete-profile', { replace: true });
    } catch (err: any) {
      setError(true);
      toast({
        variant: 'destructive',
        title: 'Código inválido',
        description: 'Verifique o código e tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    setResendLoading(true);
    setError(false);

    try {
      const { error: sendError } = await signInWithOtp(email);

      if (sendError) {
        throw sendError;
      }

      setCountdown(60);
      toast({
        title: 'Código reenviado',
        description: 'Verifique seu email.',
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

  return (
    <AuthLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 px-6 pb-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Digite o código
            </h1>
            <p className="text-muted-foreground mt-2">
              Enviamos um código de 6 dígitos para{' '}
              <span className="font-medium text-foreground">{maskedEmail}</span>
            </p>
          </div>

          <div className="space-y-8">
            <OTPInput
              onComplete={handleComplete}
              disabled={loading}
              error={error}
            />

            {loading && (
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Não recebeu o código?
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
                  'Reenviar código'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}