import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const notificationSettings = [
  {
    id: 'orders',
    label: 'Pedidos e entregas',
    description: 'Atualizações sobre seus pedidos',
    enabled: true,
  },
  {
    id: 'payments',
    label: 'Pagamentos',
    description: 'Confirmações e recibos',
    enabled: true,
  },
  {
    id: 'promotions',
    label: 'Promoções',
    description: 'Ofertas e novidades',
    enabled: false,
  },
  {
    id: 'security',
    label: 'Alertas de segurança',
    description: 'Logins e atividades suspeitas',
    enabled: true,
  },
  {
    id: 'search',
    label: 'Buscas salvas',
    description: 'Novos itens nas suas buscas',
    enabled: true,
  },
];

export default function Notifications() {
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
          <h1 className="text-lg font-semibold">Notificações</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        <p className="text-sm text-muted-foreground">
          Escolha quais notificações você quer receber.
        </p>

        <div className="rounded-2xl bg-card border divide-y">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-4"
            >
              <div className="flex-1 min-w-0">
                <Label htmlFor={setting.id} className="font-medium cursor-pointer">
                  {setting.label}
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {setting.description}
                </p>
              </div>
              <Switch
                id={setting.id}
                defaultChecked={setting.enabled}
                aria-label={setting.label}
              />
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          As notificações serão enviadas para o email cadastrado.
        </p>
      </div>
    </AppLayout>
  );
}