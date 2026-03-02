import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, RotateCcw, ChevronRight,
  Clock, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMyStore } from '@/hooks/use-store';
import { useStoreOrders, Order } from '@/hooks/use-orders';
import { useStoreReturns, returnReasons, Return } from '@/hooks/use-returns';

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  awaiting_shipment: 'Preparando envio',
  shipped: 'Em trânsito',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  confirmed: 'Confirmado',
};

const returnStatusLabels: Record<string, string> = {
  requested: 'Solicitada',
  approved: 'Aprovada',
  label_generated: 'Etiqueta gerada',
  in_transit: 'Em trânsito',
  received: 'Recebida',
  refunded: 'Reembolsada',
  rejected: 'Rejeitada',
};

export default function PostSale() {
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: orders, isLoading: loadingOrders } = useStoreOrders(store?.id || '');
  const { data: returns, isLoading: loadingReturns } = useStoreReturns(store?.id || '');
  const [tab, setTab] = useState('dispatch');

  if (loadingStore || loadingOrders || loadingReturns) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-3 gap-3">
            {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          {[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </AppLayout>
    );
  }

  if (!store) { navigate('/app/store/create'); return null; }

  const toDispatch = orders?.filter(o => ['paid', 'awaiting_shipment'].includes(o.status)) || [];
  const inTransit = orders?.filter(o => o.status === 'shipped') || [];
  const activeReturns = returns?.filter(r => !['refunded', 'rejected'].includes(r.status)) || [];

  const formatPrice = (p: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p);

  const KPICard = ({ icon: Icon, label, count, color, onClick }: { icon: typeof Package; label: string; count: number; color: string; onClick: () => void }) => (
    <button onClick={onClick} className="text-left">
      <Card className="rounded-xl hover:border-primary/40 transition-colors h-full">
        <CardContent className="p-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold">{count}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
      </Card>
    </button>
  );

  const OrderRow = ({ order, cta }: { order: Order; cta: { label: string; to: string } }) => {
    const buyerInitials = order.buyer_profile?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'C';
    return (
      <Card className="rounded-xl hover:border-primary/40 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarImage src={order.buyer_profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{buyerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-sm truncate">{order.buyer_profile?.nome || 'Comprador'}</p>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">{formatPrice(order.total)} BYX</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-muted-foreground font-mono">{order.order_number}</span>
                <span className="text-xs text-muted-foreground">• {order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <Badge variant="outline" className="text-xs">{statusLabels[order.status]}</Badge>
            <Button size="sm" className="rounded-lg h-8 text-xs" asChild>
              <Link to={cta.to}>{cta.label} <ChevronRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReturnRow = ({ ret }: { ret: Return }) => (
    <Card className="rounded-xl hover:border-primary/40 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="font-medium text-sm">{ret.buyer_profile?.nome || 'Comprador'}</p>
            <p className="text-xs text-muted-foreground font-mono">{ret.order?.order_number}</p>
          </div>
          <Badge variant="outline" className="text-xs">{returnStatusLabels[ret.status]}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          {returnReasons.find(r => r.value === ret.reason)?.label || ret.reason}
        </p>
        <div className="flex justify-end">
          <Button size="sm" className="rounded-lg h-8 text-xs" asChild>
            <Link to={`/app/store/orders/${ret.order_id}`}>Analisar devolução <ChevronRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const Empty = ({ icon: Icon, text }: { icon: typeof Package; text: string }) => (
    <div className="text-center py-12">
      <Icon className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/app/store')} className="rounded-xl">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Pós-Venda</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-3">
          <KPICard icon={Package} label="Para despachar" count={toDispatch.length} color="bg-primary/10 text-primary" onClick={() => setTab('dispatch')} />
          <KPICard icon={Truck} label="Em trânsito" count={inTransit.length} color="bg-accent text-accent-foreground" onClick={() => setTab('transit')} />
          <KPICard icon={RotateCcw} label="Devoluções" count={activeReturns.length} color="bg-warning/10 text-warning" onClick={() => setTab('returns')} />
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="dispatch">Para despachar</TabsTrigger>
            <TabsTrigger value="transit">Em trânsito</TabsTrigger>
            <TabsTrigger value="returns">Devoluções</TabsTrigger>
          </TabsList>

          <TabsContent value="dispatch" className="mt-4 space-y-3">
            {toDispatch.length === 0 ? (
              <Empty icon={CheckCircle2} text="Todos os pedidos foram despachados!" />
            ) : (
              toDispatch.map(order => (
                <OrderRow key={order.id} order={order} cta={{ label: 'Despachar agora', to: `/app/store/orders/${order.id}` }} />
              ))
            )}
          </TabsContent>

          <TabsContent value="transit" className="mt-4 space-y-3">
            {inTransit.length === 0 ? (
              <Empty icon={Truck} text="Nenhum pedido em trânsito" />
            ) : (
              inTransit.map(order => (
                <OrderRow key={order.id} order={order} cta={{ label: 'Ver rastreio', to: `/app/store/orders/${order.id}` }} />
              ))
            )}
          </TabsContent>

          <TabsContent value="returns" className="mt-4 space-y-3">
            {activeReturns.length === 0 ? (
              <Empty icon={RotateCcw} text="Nenhuma devolução pendente" />
            ) : (
              activeReturns.map(ret => <ReturnRow key={ret.id} ret={ret} />)
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
