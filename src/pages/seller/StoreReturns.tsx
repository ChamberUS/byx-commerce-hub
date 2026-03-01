import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { useMyStore } from '@/hooks/use-store';
import { useStoreReturns, returnReasons } from '@/hooks/use-returns';

const returnStatusConfig: Record<string, { label: string; color: string }> = {
  requested: { label: 'Solicitada', color: 'bg-warning/10 text-warning' },
  approved: { label: 'Aprovada', color: 'bg-primary/10 text-primary' },
  label_generated: { label: 'Etiqueta gerada', color: 'bg-primary/10 text-primary' },
  in_transit: { label: 'Em trânsito', color: 'bg-accent text-accent-foreground' },
  received: { label: 'Recebida', color: 'bg-success/10 text-success' },
  refunded: { label: 'Reembolsada', color: 'bg-success/10 text-success' },
  rejected: { label: 'Rejeitada', color: 'bg-destructive/10 text-destructive' },
};

export default function StoreReturns() {
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: returns, isLoading: loadingReturns } = useStoreReturns(store?.id || '');

  if (loadingStore || loadingReturns) {
    return <AppLayout><div className="max-w-6xl mx-auto px-4 py-6 space-y-4"><Skeleton className="h-10 w-48" />{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div></AppLayout>;
  }

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/store')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-lg font-semibold">Devoluções</h1>
            <p className="text-xs text-muted-foreground">{returns?.length || 0} devoluções</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-3">
        {(!returns || returns.length === 0) ? (
          <div className="text-center py-12">
            <RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma devolução</h3>
            <p className="text-muted-foreground text-sm">Você não recebeu nenhuma solicitação de devolução</p>
          </div>
        ) : (
          returns.map(ret => {
            const statusCfg = returnStatusConfig[ret.status] || returnStatusConfig.requested;
            return (
              <Link key={ret.id} to={`/app/store/orders/${ret.order_id}`}>
                <Card className="rounded-xl hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{ret.buyer_profile?.nome || 'Comprador'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{ret.order?.order_number}</p>
                      </div>
                      <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {returnReasons.find(r => r.value === ret.reason)?.label || ret.reason}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(ret.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
