import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Loader2, Shield } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function Terms() {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const { toast } = useToast();

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAccept = async () => {
    if (!accepted) return;

    setLoading(true);

    try {
      const { error } = await updateProfile({
        termos_aceitos_em: new Date().toISOString(),
        onboarding_completo: true,
      });

      if (error) {
        throw error;
      }

      navigate('/auth/success', { replace: true });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message || 'Tente novamente.',
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
        <div className="flex-1 px-6 pb-8 flex flex-col">
          <div className="mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Termos e Privacidade
            </h1>
            <p className="text-muted-foreground mt-2">
              Leia com atenção antes de continuar.
            </p>
          </div>

          {/* Summary */}
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-xl bg-accent/50 space-y-3">
              <h3 className="font-semibold text-foreground">Resumo</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Seus dados pessoais ficam protegidos e não são compartilhados sem sua permissão.</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Você pode baixar ou excluir seus dados a qualquer momento.</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Transações são registradas de forma segura e transparente.</span>
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <span>Você é responsável pela segurança da sua carteira e chaves.</span>
                </li>
              </ul>
            </div>

            {/* Links */}
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors text-left">
                <span className="font-medium">Termos de Uso completos</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </button>
              <button className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors text-left">
                <span className="font-medium">Política de Privacidade</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            {/* LGPD Notice */}
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-xs text-success flex items-center gap-2">
                <Shield className="h-4 w-4 flex-shrink-0" />
                Conforme a LGPD, seus dados ficam protegidos e você tem controle total sobre eles.
              </p>
            </div>
          </div>

          {/* Accept */}
          <div className="pt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked as boolean)}
                className="mt-0.5"
              />
              <span className="text-sm text-muted-foreground">
                Li e aceito os{' '}
                <span className="text-primary">Termos de Uso</span> e a{' '}
                <span className="text-primary">Política de Privacidade</span> do BYX.
              </span>
            </label>

            <Button
              onClick={handleAccept}
              disabled={!accepted || loading}
              className="w-full h-12 rounded-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                'Aceitar e continuar'
              )}
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}