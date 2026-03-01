import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle2, Truck, MapPin, MessageCircle,
  Copy, Loader2, RotateCcw, PackageSearch, Plus, Printer, ChevronDown, ChevronUp
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useTrackingHistory, useAddTrackingEvent } from '@/hooks/use-tracking';
import { useOrderReturns, useUpdateReturnStatus, returnReasons } from '@/hooks/use-returns';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';

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
  const [showTracking, setShowTracking] = useState(true);

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

  const handlePrepareShipment = async () => {
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'awaiting_shipment' });
      toast({ title: 'Status atualizado para "Preparando envio"' });
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
      toast({ title: 'Pedido despachado com sucesso!' });
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

  const handleReturnAction = async (action: 'approved' | 'rejected' | 'received' | 'refunded') => {
    if (!activeReturn) return;
    try {
      const updates: Record<string, unknown> = { returnId: activeReturn.id, status: action };
      if (action === 'approved') {
        const code = `DEV-${Date.now().toString(36).toUpperCase()}`;
        updates.return_tracking_code = code;
        updates.status = 'label_generated';
        await updateReturnStatus.mutateAsync(updates as Parameters<typeof updateReturnStatus.mutateAsync>[0]);
        await createNotification(order.buyer_id, 'return', 'Devolução aprovada ✅', `Sua devolução do pedido ${order.order_number} foi aprovada. Etiqueta disponível.`, `/app/orders/${order.id}`);
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
      toast({ title: 'Status da devolução atualizado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
  };

  const returnStatusLabels: Record<string, string> = {
    requested: 'Solicitada', approved: 'Aprovada', label_generated: 'Etiqueta gerada',
    in_transit: 'Em trânsito', received: 'Recebida', refunded: 'Reembolsada', rejected: 'Rejeitada',
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/app/store/orders')} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-semibold">Pedido</h1>
              <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
            </div>
          </div>
          <Badge className={status.color}><StatusIcon className="h-3 w-3 mr-1" />{status.label}</Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Seller Actions */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3"><CardTitle className="text-base">Ações</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {order.status === 'paid' && (
              <Button onClick={handlePrepareShipment} className="rounded-xl"><Package className="mr-2 h-4 w-4" />Preparar Envio</Button>
            )}
            {(order.status === 'awaiting_shipment' || order.status === 'paid') && (
              <Button onClick={() => setShowDispatchDialog(true)} className="rounded-xl" variant={order.status === 'awaiting_shipment' ? 'default' : 'outline'}>
                <Truck className="mr-2 h-4 w-4" />Despachar Pedido
              </Button>
            )}
            {order.status === 'shipped' && (
              <>
                <Button variant="outline" onClick={() => setShowTrackingAddDialog(true)} className="rounded-xl"><Plus className="mr-2 h-4 w-4" />Atualizar Rastreio</Button>
                <Button variant="outline" className="rounded-xl" asChild>
                  <Link to={`/app/store/orders/${order.id}/label`}><Printer className="mr-2 h-4 w-4" />Etiqueta</Link>
                </Button>
              </>
            )}
            <Button variant="outline" className="rounded-xl" asChild>
              <Link to="/app/chat"><MessageCircle className="mr-2 h-4 w-4" />Chat</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Buyer info */}
        <Card className="rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={order.buyer_profile?.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">{buyerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{order.buyer_profile?.nome || 'Comprador'}</p>
              <p className="text-xs text-muted-foreground">{order.buyer_profile?.email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Tracking */}
        {order.tracking_code && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><PackageSearch className="h-4 w-4" /> Rastreamento</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowTracking(!showTracking)} className="rounded-lg">
                  {showTracking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">{order.carrier}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{order.tracking_code}</span>
              </div>
            </CardHeader>
            {showTracking && trackingEvents && trackingEvents.length > 0 && (
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
            )}
          </Card>
        )}

        {/* Return section */}
        {activeReturn && (
          <Card className="rounded-2xl border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><RotateCcw className="h-4 w-4" /> Devolução</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">{returnStatusLabels[activeReturn.status]}</Badge>
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Motivo:</span> {returnReasons.find(r => r.value === activeReturn.reason)?.label || activeReturn.reason}</p>
              {activeReturn.details && <p className="text-xs text-muted-foreground">{activeReturn.details}</p>}
              <Separator />
              <div className="flex flex-wrap gap-2">
                {activeReturn.status === 'requested' && (
                  <>
                    <Button size="sm" className="rounded-xl" onClick={() => handleReturnAction('approved')}>Aprovar</Button>
                    <Button size="sm" variant="destructive" className="rounded-xl" onClick={() => handleReturnAction('rejected')}>Rejeitar</Button>
                  </>
                )}
                {activeReturn.status === 'label_generated' && <p className="text-xs text-muted-foreground">Aguardando comprador enviar devolução</p>}
                {(activeReturn.status === 'label_generated' || activeReturn.status === 'in_transit') && (
                  <Button size="sm" className="rounded-xl" onClick={() => handleReturnAction('received')}>Marcar como Recebida</Button>
                )}
                {activeReturn.status === 'received' && (
                  <Button size="sm" className="rounded-xl" onClick={() => handleReturnAction('refunded')}>Reembolsar</Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><Package className="h-4 w-4" /> Itens ({order.order_items?.length || 0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.product?.product_media?.[0]?.url ? <img src={item.product.product_media[0].url} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                </div>
                <div className="flex-1 min-w-0"><p className="font-medium line-clamp-1">{item.title}</p><p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p></div>
                <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)} BYX</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">{formatPrice(order.total)} BYX</span></div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        {shippingAddr && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Endereço de Entrega</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm">{shippingAddr.street}, {shippingAddr.number}</p>
              <p className="text-sm text-muted-foreground">{shippingAddr.city} - {shippingAddr.state}, CEP: {shippingAddr.zipCode}</p>
            </CardContent>
          </Card>
        )}
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
