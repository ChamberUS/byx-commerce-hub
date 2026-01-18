import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, ExternalLink, Loader2, Shield } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useActiveLegalDocument, useUserAcceptances, useAcceptLegalDocument } from '@/hooks/use-legal';

export default function Terms() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: termsDoc, isLoading: loadingTerms } = useActiveLegalDocument('terms');
  const { data: privacyDoc } = useActiveLegalDocument('privacy');
  const { data: acceptances, isLoading: loadingAcceptances } = useUserAcceptances();
  const acceptDocument = useAcceptLegalDocument();

  const [accepted, setAccepted] = useState(false);

  const hasAcceptedTerms = termsDoc && acceptances?.some(a => a.document_id === termsDoc.id);

  // If already accepted, redirect
  if (hasAcceptedTerms && !loadingAcceptances) {
    navigate('/auth/success', { replace: true });
    return null;
  }

  const handleAccept = async () => {
    if (!accepted || !termsDoc) return;

    try {
      await acceptDocument.mutateAsync(termsDoc.id);
      navigate('/auth/success', { replace: true });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: err.message || 'Tente novamente.',
      });
    }
  };

  if (loadingTerms || loadingAcceptances) {
    return (
      <AuthLayout>
        <div className="flex flex-col h-full p-6">
          <Skeleton className="h-14 w-14 rounded-2xl mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="flex flex-col h-full">
        <div className="flex items-center p-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 px-6 pb-8 flex flex-col">
          <div className="mb-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Termos e Privacidade</h1>
            <p className="text-muted-foreground mt-2">
              {termsDoc?.version ? `Versão ${termsDoc.version}` : 'Leia com atenção antes de continuar.'}
            </p>
          </div>

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
              </ul>
            </div>

            <div className="space-y-2">
              <a href="/legal/terms" target="_blank" className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors text-left">
                <span className="font-medium">Termos de Uso completos</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
              <a href="/legal/privacy" target="_blank" className="w-full flex items-center justify-between p-4 rounded-xl border hover:bg-accent/50 transition-colors text-left">
                <span className="font-medium">Política de Privacidade</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </div>

            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <p className="text-xs text-success flex items-center gap-2">
                <Shield className="h-4 w-4 flex-shrink-0" />
                Conforme a LGPD, seus dados ficam protegidos.
              </p>
            </div>
          </div>

          <div className="pt-6 space-y-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox checked={accepted} onCheckedChange={(checked) => setAccepted(checked as boolean)} className="mt-0.5" />
              <span className="text-sm text-muted-foreground">
                Li e aceito os <span className="text-primary">Termos de Uso</span> e a <span className="text-primary">Política de Privacidade</span> do BYX.
              </span>
            </label>

            <Button onClick={handleAccept} disabled={!accepted || acceptDocument.isPending} className="w-full h-12 rounded-xl" size="lg">
              {acceptDocument.isPending ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Finalizando...</>
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
