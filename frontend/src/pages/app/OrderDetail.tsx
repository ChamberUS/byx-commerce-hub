import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Clock, CheckCircle2, 
  Truck, MapPin, MessageCircle, Copy, ExternalLink,
  Wallet, Loader2, Shield, RotateCcw, PackageSearch,
  ChevronDown, ChevronUp
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useTrackingHistory } from '@/hooks/use-tracking';
import { useOrderReturns, useCreateReturn, returnReasons } from '@/hooks/use-returns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Aguardando Pagamento', color: 'bg-warning/10 text-warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary', icon: CheckCircle2 },
  paid: { label: 'Pago', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  awaiting_shipment: { label: 'Preparando Envio', color: 'bg-accent text-accent-foreground', icon: Package },
  shipped: { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: Clock },
  refunded: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground', icon: RotateCcw },
};

const trackingStatusLabels: Record<string, string> = {
  posted: 'Postado',
  in_transit: 'Em trânsito',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: trackingEvents } = useTrackingHistory(id || '');
  const { data: returns } = useOrderReturns(id || '');
  const updateOrderStatus = useUpdateOrderStatus();
  const createReturn = useCreateReturn();
  
  const [isPaying, setIsPaying] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!order) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2>
          <Button onClick={() => navigate('/app/orders')} className="rounded-xl">
            Ver meus pedidos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const isBuyer = order.buyer_id === user?.id;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast({ title: 'Número copiado!' });
  };

  const handlePayOrder = async () => {
    setIsPaying(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'paid' });
      // Notify store owner
      if (order.store?.id) {
        const { data: storeData } = await (await import('@/integrations/supabase/client')).supabase
          .from('stores').select('owner_id').eq('id', order.store_id).maybeSingle();
        if (storeData?.owner_id) {
          await createNotification(storeData.owner_id, 'order', 'Pedido pago!', `Pedido ${order.order_number} foi pago.`, `/app/store/orders/${order.id}`);
        }
      }
      toast({ title: 'Pagamento confirmado!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao processar pagamento' });
    } finally { setIsPaying(false); }
  };

  const handleConfirmDelivery = async () => {
    setIsConfirming(true);
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'delivered' });
      toast({ title: 'Recebimento confirmado!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao confirmar recebimento' });
    } finally { setIsConfirming(false); }
  };

  const handleRequestReturn = async () => {
    if (!returnReason) return;
    try {
      await createReturn.mutateAsync({
        order_id: order.id,
        store_id: order.store_id,
        reason: returnReason,
        details: returnDetails || undefined,
      });
      // Notify seller
      const { data: storeData } = await (await import('@/integrations/supabase/client')).supabase
        .from('stores').select('owner_id').eq('id', order.store_id).maybeSingle();
      if (storeData?.owner_id) {
        await createNotification(storeData.owner_id, 'return', 'Nova devolução solicitada', `Pedido ${order.order_number} teve devolução solicitada.`, `/app/store/orders/${order.id}`);
      }
      setShowReturnDialog(false);
      setReturnReason('');
      setReturnDetails('');
      toast({ title: 'Devolução solicitada com sucesso!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao solicitar devolução' });
    }
  };

  const status = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = status.icon;
  const storeInitials = order.store?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'L';
  const shippingAddr = order.shipping_address as Record<string, string> | null;
  const canRequestReturn = isBuyer && ['paid', 'shipped', 'delivered'].includes(order.status) && (!returns || returns.length === 0);
  const activeReturn = returns?.[0];

  const returnStatusLabels: Record<string, string> = {
    requested: 'Solicitada', approved: 'Aprovada', label_generated: 'Etiqueta gerada',
    in_transit: 'Em trânsito', received: 'Recebida', refunded: 'Reembolsada', rejected: 'Rejeitada',
  };

  // Timeline steps
  const timelineSteps = [
    { label: 'Pedido criado', date: order.created_at, done: true },
    { label: 'Pagamento confirmado', date: order.paid_at, done: !!order.paid_at },
    { label: 'Preparando envio', date: order.awaiting_shipment_at, done: !!order.awaiting_shipment_at },
    { label: 'Despachado', date: order.shipped_at, done: !!order.shipped_at },
    { label: 'Entregue', date: order.delivered_at, done: !!order.delivered_at },
  ];

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Pedido</h1>
              <button onClick={copyOrderNumber} className="text-xs text-muted-foreground flex items-center gap-1">
                {order.order_number} <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <Badge className={status.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </Badge>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Payment CTA */}
        {isBuyer && order.status === 'pending' && (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Pagar com AIOS/BYX</h3>
                  <p className="text-sm text-muted-foreground">Complete seu pagamento</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-4">
                <div className="flex items-center gap-2 text-success">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Compra Protegida BYX</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Pagamento em escrow até você confirmar o recebimento</p>
              </div>
              <Button className="w-full h-12 rounded-xl" size="lg" onClick={handlePayOrder} disabled={isPaying}>
                {isPaying ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processando...</> : <><Wallet className="mr-2 h-5 w-5" />Pagar {formatPrice(order.total)} BYX</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirm delivery */}
        {isBuyer && order.status === 'shipped' && (
          <Card className="rounded-2xl border-success/20 bg-success/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center">
                  <Truck className="h-6 w-6 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">Pedido enviado!</h3>
                  <p className="text-sm text-muted-foreground">Confirme quando receber</p>
                </div>
              </div>
              <Button className="w-full h-12 rounded-xl bg-success hover:bg-success/90" size="lg" onClick={handleConfirmDelivery} disabled={isConfirming}>
                {isConfirming ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Confirmando...</> : <><CheckCircle2 className="mr-2 h-5 w-5" />Confirmar Recebimento</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Store card */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <Link to={`/app/store/${order.store?.slug}`} className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={order.store?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{storeInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{order.store?.name}</p>
                <p className="text-sm text-muted-foreground">Ver loja</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Order Timeline */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {timelineSteps.map((step, i) => (
                <div key={step.label} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full shrink-0 ${step.done ? 'bg-primary' : 'bg-muted'}`} />
                    {i < timelineSteps.length - 1 && <div className={`w-0.5 flex-1 min-h-[24px] ${step.done ? 'bg-primary' : 'bg-muted'}`} />}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm ${step.done ? 'font-medium' : 'text-muted-foreground'}`}>{step.label}</p>
                    {step.date && <p className="text-xs text-muted-foreground">{format(new Date(step.date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tracking section */}
        {order.tracking_code && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <PackageSearch className="h-4 w-4" /> Rastreamento
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowTracking(!showTracking)} className="rounded-lg">
                  {showTracking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="font-mono text-xs">{order.carrier || 'Transportadora'}</Badge>
                <span className="text-xs text-muted-foreground font-mono">{order.tracking_code}</span>
              </div>
              {order.tracking_url && (
                <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 inline-block">
                  Rastrear externamente →
                </a>
              )}
            </CardHeader>
            {showTracking && trackingEvents && trackingEvents.length > 0 && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {trackingEvents.map((ev, i) => (
                    <div key={ev.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                        {i < trackingEvents.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-muted" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium">{trackingStatusLabels[ev.status_code] || ev.status_code}</p>
                        <p className="text-xs text-muted-foreground">{ev.description}</p>
                        {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                        <p className="text-xs text-muted-foreground">{format(new Date(ev.occurred_at), "dd/MM 'às' HH:mm", { locale: ptBR })}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {!order.tracking_code && ['paid', 'awaiting_shipment'].includes(order.status) && (
          <Card className="rounded-2xl border-dashed">
            <CardContent className="p-6 text-center">
              <PackageSearch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Aguardando envio</p>
              <p className="text-xs text-muted-foreground">O vendedor está preparando seu pedido</p>
            </CardContent>
          </Card>
        )}

        {/* Return status */}
        {activeReturn && (
          <Card className="rounded-2xl border-warning/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <RotateCcw className="h-4 w-4" /> Devolução
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant="outline">{returnStatusLabels[activeReturn.status] || activeReturn.status}</Badge>
              </div>
              <p className="text-sm"><span className="text-muted-foreground">Motivo:</span> {returnReasons.find(r => r.value === activeReturn.reason)?.label || activeReturn.reason}</p>
              {activeReturn.details && <p className="text-xs text-muted-foreground mt-1">{activeReturn.details}</p>}
              {activeReturn.return_tracking_code && (
                <p className="text-xs font-mono mt-2">Rastreio devolução: {activeReturn.return_tracking_code}</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Items */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" /> Itens ({order.order_items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item) => {
              const imageUrl = item.product?.product_media?.[0]?.url;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {imageUrl ? <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-5 w-5 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)} BYX</p>
                </div>
              );
            })}
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)} BYX</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frete</span><span>{order.shipping_cost === 0 ? 'Grátis' : `${formatPrice(order.shipping_cost || 0)} BYX`}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">{formatPrice(order.total)} BYX</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        {shippingAddr && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><MapPin className="h-4 w-4" /> Endereço de Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{shippingAddr.street}, {shippingAddr.number}{shippingAddr.complement && ` - ${shippingAddr.complement}`}</p>
              <p className="text-sm text-muted-foreground">{shippingAddr.neighborhood && `${shippingAddr.neighborhood}, `}{shippingAddr.city} - {shippingAddr.state}</p>
              <p className="text-sm text-muted-foreground">CEP: {shippingAddr.zipCode}</p>
            </CardContent>
          </Card>
        )}

        {order.notes && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3"><CardTitle className="text-base">Observações</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{order.notes}</p></CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 rounded-xl" asChild>
              <Link to="/app/chat"><MessageCircle className="mr-2 h-4 w-4" />Contatar Vendedor</Link>
            </Button>
          </div>
          {canRequestReturn && (
            <Button variant="outline" className="rounded-xl border-warning/30 text-warning hover:bg-warning/5" onClick={() => setShowReturnDialog(true)}>
              <RotateCcw className="mr-2 h-4 w-4" /> Solicitar Devolução
            </Button>
          )}
        </div>
      </div>

      {/* Return Request Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Solicitar Devolução</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Motivo</label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                <SelectContent>
                  {returnReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Detalhes (opcional)</label>
              <Textarea value={returnDetails} onChange={e => setReturnDetails(e.target.value)} placeholder="Descreva o problema..." className="rounded-xl" rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReturnDialog(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={handleRequestReturn} disabled={!returnReason || createReturn.isPending} className="rounded-xl">
              {createReturn.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar Solicitação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
