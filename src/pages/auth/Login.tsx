import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Mail } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Digite um email válido');

export default function Login() {
  const navigate = useNavigate();
  const { signInWithOtp } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    const result = emailSchema.safeParse(email.trim());
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    setLoading(true);

    try {
      const { error: signInError } = await signInWithOtp(email.trim());

      if (signInError) {
        throw signInError;
      }

      // Store email for verification page
      sessionStorage.setItem('byx_auth_email', email.trim());
      navigate('/auth/verify');
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

  return (
    <AuthLayout>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 pb-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">
              Entrar ou criar conta
            </h1>
            <p className="text-muted-foreground mt-2">
              Digite seu email para receber um código de acesso.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                  }}
                  className={`pl-10 h-12 rounded-xl ${error ? 'border-destructive' : ''}`}
                  autoComplete="email"
                  autoFocus
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full h-12 rounded-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando código...
                </>
              ) : (
                'Receber código'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Ao continuar, você concorda com nossos{' '}
            <button className="text-primary hover:underline">
              Termos de Uso
            </button>{' '}
            e{' '}
            <button className="text-primary hover:underline">
              Política de Privacidade
            </button>
            .
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}