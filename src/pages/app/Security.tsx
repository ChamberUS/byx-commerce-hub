import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  KeyRound,
  Fingerprint,
  Smartphone,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsItem } from '@/components/account/SettingsItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Security() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Segurança</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* Wallet Warning */}
        <div className="p-4 rounded-2xl bg-warning/10 border border-warning/20">
          <div className="flex gap-3">
            <div className="p-2 rounded-xl bg-warning/20">
              <Wallet className="h-5 w-5 text-warning" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                Carteira não configurada
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Configure sua Carteira BYX para habilitar as opções de segurança abaixo.
              </p>
              <Button size="sm" className="mt-3 rounded-xl">
                Configurar agora
              </Button>
            </div>
          </div>
        </div>

        {/* Security Options */}
        <div className="rounded-2xl bg-card border divide-y">
          <SettingsItem
            icon={KeyRound}
            label="PIN da Carteira"
            description="Proteja suas transações"
            disabled
            rightElement={
              <Badge variant="secondary" className="text-xs">
                Requer carteira
              </Badge>
            }
          />
          <SettingsItem
            icon={Fingerprint}
            label="Biometria"
            description="Use sua digital ou Face ID"
            disabled
            rightElement={
              <Badge variant="secondary" className="text-xs">
                Requer carteira
              </Badge>
            }
          />
          <SettingsItem
            icon={Smartphone}
            label="Dispositivos conectados"
            description="Gerencie seus dispositivos"
            onClick={() => {}}
          />
        </div>

        {/* Tips */}
        <div className="p-4 rounded-2xl bg-muted/50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground">Dica de segurança</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Nunca compartilhe seu PIN ou frase de recuperação. A equipe BYX nunca pedirá essas informações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}