import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User } from 'lucide-react';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function CompleteProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const [nome, setNome] = useState(profile?.nome || '');
  const [modoIniciante, setModoIniciante] = useState(profile?.modo_iniciante ?? true);
  const [loading, setLoading] = useState(false);

  // Get profile type from sessionStorage if it exists
  const storedProfileType = sessionStorage.getItem('byx_profile_type') as 'cliente' | 'lojista' | null;

  useEffect(() => {
    if (profile?.onboarding_completo) {
      navigate('/app', { replace: true });
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nome obrigatório',
        description: 'Digite seu nome para continuar.',
      });
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        nome: nome.trim(),
        modo_iniciante: modoIniciante,
      };

      // Set profile type if it was selected in previous step
      if (storedProfileType) {
        updateData.tipo_usuario = storedProfileType;
        sessionStorage.removeItem('byx_profile_type');
      }

      const { error } = await updateProfile(updateData);

      if (error) {
        throw error;
      }

      navigate('/auth/terms', { replace: true });
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
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <User className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Complete seu perfil
          </h1>
          <p className="text-muted-foreground mt-2">
            Precisamos de algumas informações para personalizar sua experiência.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="space-y-6 flex-1">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="nome">Como podemos te chamar?</Label>
              <Input
                id="nome"
                type="text"
                placeholder="Seu nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="h-12 rounded-xl"
                autoFocus
              />
            </div>

            {/* Modo iniciante */}
            <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/50">
              <div className="flex-1">
                <Label htmlFor="modo-iniciante" className="font-medium">
                  Modo iniciante
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Ative para receber explicações simples e guias passo a passo ao usar o app.
                </p>
              </div>
              <Switch
                id="modo-iniciante"
                checked={modoIniciante}
                onCheckedChange={setModoIniciante}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading || !nome.trim()}
              className="w-full h-12 rounded-xl"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Continuar'
              )}
            </Button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}