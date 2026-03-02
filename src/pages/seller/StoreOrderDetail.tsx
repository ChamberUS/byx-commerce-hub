import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle2, Truck, MapPin, MessageCircle,
  Loader2, RotateCcw, PackageSearch, Plus, Printer, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useTrackingHistory, useAddTrackingEvent } from '@/hooks/use-tracking';
import { useOrderReturns, useUpdateReturnStatus, returnReasons } from '@/hooks/use-returns';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';
import { cn } from '@/lib/utils';

const carriers = ['Correios PAC', 'Correios SEDEX', 'Jadlog', 'Loggi', 'Total Express', 'Outra'];

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: Clock },
  paid: { label: 'Pago', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  awaiting_shipment: { label: 'Preparando Envio', color: 'bg-accent text-accent-foreground', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: Clock },
  refunded: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground', icon: RotateCcw },
  confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary', icon: CheckCircle2 },
};

const timelineSteps = ['paid', 'awaiting_shipment', 'shipped', 'delivered'] as const;
const timelineLabels: Record<string, string> = {
  paid: 'Pago', awaiting_shipment: 'Preparando', shipped: 'Despachado', delivered: 'Entregue',
};

const nextActionConfig: Record<string, { title: string; description: string; buttonLabel: string; action: string }> = {
  paid: { title: 'Preparar envio', description: 'O pagamento foi confirmado. Prepare o pedido para despacho.', buttonLabel: 'Preparar Envio', action: 'prepare' },
  awaiting_shipment: { title: 'Despachar pedido', description: 'O pedido está pronto. Informe a transportadora e código de rastreio.', buttonLabel: 'Despachar Pedido', action: 'dispatch' },
  shipped: { title: 'Acompanhar entrega', description: 'O pedido está em trânsito. Você pode adicionar atualizações de rastreio.', buttonLabel: 'Atualizar Rastreio', action: 'tracking' },
  delivered: { title: 'Pedido concluído', description: 'O comprador confirmou o recebimento. Nenhuma ação necessária.', buttonLabel: '', action: '' },
};

const returnStatusLabels: Record<string, string> = {
  requested: 'Solicitada', approved: 'Aprovada', label_generated: 'Etiqueta gerada',
  in_transit: 'Em trânsito', received: 'Recebida', refunded: 'Reembolsada', rejected: 'Rejeitada',
};

export default function StoreOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: trackingEvents } = useTrackingHistory(id || '');
  const { data: returns } = useOrderReturns(id || '');
  const updateOrderStatus = useUpdateOrderStatus();
  const addTrackingEvent = useAddTrackingEvent();
  const updateReturnStatus = useUpdateReturnStatus();

  const [showDispatchDialog, setShowDispatchDialog] = useState(false);
  const [carrier, setCarrier] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isDispatching, setIsDispatching] = useState(false);

  const [showTrackingAddDialog, setShowTrackingAddDialog] = useState(false);
  const [newTrackingStatus, setNewTrackingStatus] = useState('in_transit');
  const [newTrackingDesc, setNewTrackingDesc] = useState('');
  const [newTrackingLocation, setNewTrackingLocation] = useState('');
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);

  if (isLoading) {
    return <AppLayout><div className="max-w-2xl mx-auto px-4 py-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div></AppLayout>;
  }
  if (!order) {
    return <AppLayout><div className="max-w-2xl mx-auto px-4 py-12 text-center"><Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2></div></AppLayout>;
  }

  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p);
  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const buyerInitials = order.buyer_profile?.nome?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'C';
  const shippingAddr = order.shipping_address as Record<string, string> | null;
  const activeReturn = returns?.[0];
  const nextAction = nextActionConfig[order.status];

  // Determine current step index for horizontal timeline
  const currentStepIdx = timelineSteps.indexOf(order.status as typeof timelineSteps[number]);

  const handlePrepareShipment = async () => {
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'awaiting_shipment' });
      toast({ title: 'Preparando envio!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
  };

  const handleDispatch = async () => {
    if (!carrier || !trackingCode) return;
    setIsDispatching(true);
    try {
      await updateOrderStatus.mutateAsync({
        orderId: order.id, status: 'shipped',
        carrier, tracking_code: trackingCode, tracking_url: trackingUrl || undefined,
      });
      await addTrackingEvent.mutateAsync({
        order_id: order.id, status_code: 'posted', description: `Postado via ${carrier}`,
      });
      await createNotification(order.buyer_id, 'order', 'Pedido despachado! 📦', `Seu pedido ${order.order_number} foi enviado via ${carrier}. Código: ${trackingCode}`, `/app/orders/${order.id}`);
      setShowDispatchDialog(false);
      toast({ title: 'Pedido despachado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro ao despachar' }); }
    finally { setIsDispatching(false); }
  };

  const handleAddTrackingEvent = async () => {
    if (!newTrackingDesc) return;
    try {
      await addTrackingEvent.mutateAsync({
        order_id: order.id, status_code: newTrackingStatus, description: newTrackingDesc,
        location: newTrackingLocation || undefined,
      });
      if (newTrackingStatus === 'delivered') {
        await createNotification(order.buyer_id, 'order', 'Pedido entregue! ✅', `Seu pedido ${order.order_number} foi entregue.`, `/app/orders/${order.id}`);
      }
      setShowTrackingAddDialog(false);
      setNewTrackingDesc(''); setNewTrackingLocation('');
      toast({ title: 'Rastreio atualizado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
  };

  const handleNextAction = () => {
    if (!nextAction) return;
    if (nextAction.action === 'prepare') handlePrepareShipment();
    else if (nextAction.action === 'dispatch') setShowDispatchDialog(true);
    else if (nextAction.action === 'tracking') setShowTrackingAddDialog(true);
  };

  const handleReturnAction = async (action: 'approved' | 'rejected' | 'received' | 'refunded') => {
    if (!activeReturn) return;
    try {
      if (action === 'approved') {
        const code = `DEV-${Date.now().toString(36).toUpperCase()}`;
        await updateReturnStatus.mutateAsync({ returnId: activeReturn.id, status: 'label_generated', return_tracking_code: code });
        await createNotification(order.buyer_id, 'return', 'Devolução aprovada ✅', `Etiqueta de devolução disponível para o pedido ${order.order_number}.`, `/app/orders/${order.id}`);
      } else if (action === 'received') {
        await updateReturnStatus.mutateAsync({ returnId: activeReturn.id, status: 'received' });
        await createNotification(order.buyer_id, 'return', 'Devolução recebida', `Recebemos a devolução do pedido ${order.order_number}.`, `/app/orders/${order.id}`);
      } else if (action === 'refunded') {
        await updateReturnStatus.mutateAsync({ returnId: activeReturn.id, status: 'refunded' });
        await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'refunded' });
        await createNotification(order.buyer_id, 'return', 'Reembolso concluído! 💰', `O reembolso do pedido ${order.order_number} foi processado.`, `/app/orders/${order.id}`);
      } else {
        await updateReturnStatus.mutateAsync({ returnId: activeReturn.id, status: action });
      }
      toast({ title: 'Status atualizado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
  };

  return (
    <AppLayout>
      {/* Header with badge */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/store/post-sale')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-semibold">Pedido</h1>
              <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
            </div>
          </div>
          <Badge className={status.color}><StatusIcon className="h-3 w-3 mr-1" />{status.label}</Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">

        {/* Horizontal Timeline */}
        <div className="flex items-center justify-between px-2">
          {timelineSteps.map((step, i) => {
            const done = currentStepIdx >= i;
            const isCurrent = currentStepIdx === i;
            return (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors',
                    done ? 'bg-primary border-primary text-primary-foreground' :
                    'bg-background border-muted text-muted-foreground'
                  )}>
                    {done && !isCurrent ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={cn('text-[10px] mt-1', done ? 'text-foreground font-medium' : 'text-muted-foreground')}>{timelineLabels[step]}</span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div className={cn('flex-1 h-0.5 mx-1', done && currentStepIdx > i ? 'bg-primary' : 'bg-muted')} />
                )}
              </div>
            );
          })}
        </div>

        {/* Next Action Card */}
        {nextAction && nextAction.action && (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <h3 className="font-semibold text-base mb-1">{nextAction.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{nextAction.description}</p>
              <Button className="w-full rounded-xl h-11" onClick={handleNextAction}>
                {nextAction.buttonLabel}
              </Button>
            </CardContent>
          </Card>
        )}

        {nextAction && !nextAction.action && (
          <Card className="rounded-2xl border-success/20 bg-success/5">
            <CardContent className="p-5 text-center">
              <CheckCircle2 className="h-8 w-8 text-success mx-auto mb-2" />
              <h3 className="font-semibold">{nextAction.title}</h3>
              <p className="text-sm text-muted-foreground">{nextAction.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Buyer info */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={order.buyer_profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{buyerInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{order.buyer_profile?.nome || 'Comprador'}</p>
              <p className="text-xs text-muted-foreground">{order.buyer_profile?.email}</p>
            </div>
            <p className="font-semibold text-primary">{formatPrice(order.total)} BYX</p>
          </CardContent>
        </Card>

        {/* Tracking Events */}
        {order.tracking_code && trackingEvents && trackingEvents.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Atualizações do rastreio</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">{order.carrier}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{order.tracking_code}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              {trackingEvents.map((ev, i) => (
                <div key={ev.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                    {i < trackingEvents.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-muted" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium">{ev.description}</p>
                    {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                    <p className="text-xs text-muted-foreground">{format(new Date(ev.occurred_at), "dd/MM 'às' HH:mm", { locale: ptBR })}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Return section */}
        {activeReturn && (
          <Card className="rounded-2xl border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-warning" />
                  <span className="font-medium text-sm">Devolução</span>
                </div>
                <Badge variant="outline">{returnStatusLabels[activeReturn.status]}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {returnReasons.find(r => r.value === activeReturn.reason)?.label || activeReturn.reason}
              </p>
              {activeReturn.status === 'requested' && (
                <div className="flex gap-2">
                  <Button size="sm" className="rounded-lg flex-1" onClick={() => handleReturnAction('approved')}>Aprovar</Button>
                  <Button size="sm" variant="destructive" className="rounded-lg" onClick={() => handleReturnAction('rejected')}>Rejeitar</Button>
                </div>
              )}
              {(activeReturn.status === 'label_generated' || activeReturn.status === 'in_transit') && (
                <Button size="sm" className="rounded-lg w-full" onClick={() => handleReturnAction('received')}>Marcar como Recebida</Button>
              )}
              {activeReturn.status === 'received' && (
                <Button size="sm" className="rounded-lg w-full" onClick={() => handleReturnAction('refunded')}>Reembolsar</Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items summary */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3"><CardTitle className="text-base">Itens ({order.order_items?.length || 0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-3 items-center">
                <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                  {item.product?.product_media?.[0]?.url ? <img src={item.product.product_media[0].url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p></div>
                <p className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* More Actions (collapsed) */}
        <Collapsible open={moreActionsOpen} onOpenChange={setMoreActionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between rounded-xl text-muted-foreground">
              Mais ações <ChevronDown className={cn("h-4 w-4 transition-transform", moreActionsOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {order.tracking_code && (
              <Button variant="outline" className="w-full rounded-xl justify-start" asChild>
                <Link to={`/app/store/orders/${order.id}/label`}><Printer className="mr-2 h-4 w-4" />Ver etiqueta de envio</Link>
              </Button>
            )}
            <Button variant="outline" className="w-full rounded-xl justify-start" asChild>
              <Link to="/app/chat"><MessageCircle className="mr-2 h-4 w-4" />Contatar comprador</Link>
            </Button>
            {order.status === 'shipped' && (
              <Button variant="outline" className="w-full rounded-xl justify-start" onClick={() => setShowTrackingAddDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />Adicionar atualização de rastreio
              </Button>
            )}
            {shippingAddr && (
              <div className="px-4 py-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-1 mb-1"><MapPin className="h-3 w-3" /> Endereço de entrega</p>
                <p>{shippingAddr.street}, {shippingAddr.number} — {shippingAddr.city}/{shippingAddr.state} CEP: {shippingAddr.zipCode}</p>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Dispatch Dialog */}
      <Dialog open={showDispatchDialog} onOpenChange={setShowDispatchDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Despachar Pedido</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Transportadora</label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>{carriers.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Código de rastreio</label>
              <Input value={trackingCode} onChange={e => setTrackingCode(e.target.value)} placeholder="Ex: BR123456789" className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">URL de rastreio (opcional)</label>
              <Input value={trackingUrl} onChange={e => setTrackingUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDispatchDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleDispatch} disabled={!carrier || !trackingCode || isDispatching} className="rounded-xl">
              {isDispatching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}Confirmar Despacho
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tracking Event Dialog */}
      <Dialog open={showTrackingAddDialog} onOpenChange={setShowTrackingAddDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Adicionar Atualização de Rastreio</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Status</label>
              <Select value={newTrackingStatus} onValueChange={setNewTrackingStatus}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_transit">Em trânsito</SelectItem>
                  <SelectItem value="out_for_delivery">Saiu para entrega</SelectItem>
                  <SelectItem value="delivered">Entregue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Descrição</label>
              <Input value={newTrackingDesc} onChange={e => setNewTrackingDesc(e.target.value)} placeholder="Objeto em trânsito..." className="rounded-xl" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Local (opcional)</label>
              <Input value={newTrackingLocation} onChange={e => setNewTrackingLocation(e.target.value)} placeholder="São Paulo, SP" className="rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingAddDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleAddTrackingEvent} disabled={!newTrackingDesc || addTrackingEvent.isPending} className="rounded-xl">Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
