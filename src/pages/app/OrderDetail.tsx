import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Package, Clock, CheckCircle2,
  Truck, MapPin, MessageCircle, Copy, ExternalLink,
  Wallet, Loader2, Shield, RotateCcw, PackageSearch
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useTrackingHistory } from '@/hooks/use-tracking';
import { useOrderReturns, useCreateReturn, returnReasons } from '@/hooks/use-returns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createNotification } from '@/lib/notifications';

const statusHumanMessage: Record<string, string> = {
  pending: 'Aguardando seu pagamento.',
  paid: 'Pagamento confirmado! O vendedor está preparando seu pedido.',
  awaiting_shipment: 'O vendedor está preparando o envio do seu pedido.',
  shipped: 'Seu pedido foi despachado e está a caminho!',
  delivered: 'Seu pedido foi entregue. Obrigado pela compra!',
  cancelled: 'Este pedido foi cancelado.',
  refunded: 'Seu reembolso foi processado.',
  confirmed: 'Pedido confirmado pelo vendedor.',
};

const returnStatusLabels: Record<string, string> = {
  requested: 'Solicitada', approved: 'Aprovada', label_generated: 'Etiqueta disponível',
  in_transit: 'Em trânsito', received: 'Recebida', refunded: 'Reembolsada', rejected: 'Rejeitada',
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
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDetails, setReturnDetails] = useState('');

  if (isLoading) {
    return <AppLayout><div className="max-w-2xl mx-auto px-4 py-6 space-y-4"><Skeleton className="h-8 w-48" /><Skeleton className="h-32 rounded-xl" /><Skeleton className="h-48 rounded-xl" /></div></AppLayout>;
  }

  if (!order) {
    return <AppLayout><div className="max-w-2xl mx-auto px-4 py-12 text-center"><Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" /><h2 className="text-xl font-semibold mb-2">Pedido não encontrado</h2><Button onClick={() => navigate('/app/orders')} className="rounded-xl">Ver meus pedidos</Button></div></AppLayout>;
  }

  const isBuyer = order.buyer_id === user?.id;
  const formatPrice = (p: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(p);
  const copyOrderNumber = () => { navigator.clipboard.writeText(order.order_number); toast({ title: 'Número copiado!' }); };

  const storeInitials = order.store?.name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'L';
  const shippingAddr = order.shipping_address as Record<string, string> | null;
  const canRequestReturn = isBuyer && ['paid', 'shipped', 'delivered'].includes(order.status) && (!returns || returns.length === 0);
  const activeReturn = returns?.[0];

  const handlePayOrder = async () => {
    setIsPaying(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'paid' });
      if (order.store?.id) {
        const { data: storeData } = await (await import('@/integrations/supabase/client')).supabase
          .from('stores').select('owner_id').eq('id', order.store_id).maybeSingle();
        if (storeData?.owner_id) {
          await createNotification(storeData.owner_id, 'order', 'Pedido pago!', `Pedido ${order.order_number} foi pago.`, `/app/store/orders/${order.id}`);
        }
      }
      toast({ title: 'Pagamento confirmado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro ao processar pagamento' }); }
    finally { setIsPaying(false); }
  };

  const handleConfirmDelivery = async () => {
    setIsConfirming(true);
    try {
      await updateOrderStatus.mutateAsync({ orderId: order.id, status: 'delivered' });
      toast({ title: 'Recebimento confirmado!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
    finally { setIsConfirming(false); }
  };

  const handleRequestReturn = async () => {
    if (!returnReason) return;
    try {
      await createReturn.mutateAsync({ order_id: order.id, store_id: order.store_id, reason: returnReason, details: returnDetails || undefined });
      const { data: storeData } = await (await import('@/integrations/supabase/client')).supabase
        .from('stores').select('owner_id').eq('id', order.store_id).maybeSingle();
      if (storeData?.owner_id) {
        await createNotification(storeData.owner_id, 'return', 'Nova devolução solicitada', `Pedido ${order.order_number} teve devolução solicitada.`, `/app/store/orders/${order.id}`);
      }
      setShowReturnDialog(false); setReturnReason(''); setReturnDetails('');
      toast({ title: 'Devolução solicitada!' });
    } catch { toast({ variant: 'destructive', title: 'Erro' }); }
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-lg font-semibold">Pedido</h1>
              <button onClick={copyOrderNumber} className="text-xs text-muted-foreground flex items-center gap-1">{order.order_number} <Copy className="h-3 w-3" /></button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-20 md:pb-6">

        {/* "Onde está meu pedido?" — status hero */}
        <Card className="rounded-2xl">
          <CardContent className="p-5">
            <h2 className="font-semibold text-base mb-2">Onde está meu pedido?</h2>
            <p className="text-sm text-muted-foreground">{statusHumanMessage[order.status] || 'Processando...'}</p>

            {/* Tracking timeline */}
            {trackingEvents && trackingEvents.length > 0 ? (
              <div className="mt-4 space-y-3">
                {trackingEvents.map((ev, i) => (
                  <div key={ev.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${i === 0 ? 'bg-primary' : 'bg-muted'}`} />
                      {i < trackingEvents.length - 1 && <div className="w-0.5 flex-1 min-h-[20px] bg-muted" />}
                    </div>
                    <div className="pb-2">
                      <p className="text-sm font-medium">{ev.description}</p>
                      {ev.location && <p className="text-xs text-muted-foreground">{ev.location}</p>}
                      <p className="text-xs text-muted-foreground">{format(new Date(ev.occurred_at), "dd/MM 'às' HH:mm", { locale: ptBR })}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : ['paid', 'awaiting_shipment'].includes(order.status) ? (
              <div className="mt-4 flex items-center gap-3 text-muted-foreground">
                <PackageSearch className="h-5 w-5" />
                <p className="text-sm">Vendedor preparando envio</p>
              </div>
            ) : null}

            {order.tracking_code && (
              <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono">{order.carrier} • {order.tracking_code}</span>
                {order.tracking_url && (
                  <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Rastrear →</a>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment CTA */}
        {isBuyer && order.status === 'pending' && (
          <Card className="rounded-2xl border-primary/20 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><Wallet className="h-5 w-5 text-primary" /></div>
                <div><h3 className="font-semibold text-sm">Pagar com AIOS/BYX</h3><p className="text-xs text-muted-foreground">Compra protegida com escrow</p></div>
              </div>
              <Button className="w-full rounded-xl h-11" onClick={handlePayOrder} disabled={isPaying}>
                {isPaying ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processando...</> : <><Wallet className="mr-2 h-4 w-4" />Pagar {formatPrice(order.total)} BYX</>}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Confirm delivery CTA */}
        {isBuyer && order.status === 'shipped' && (
          <Button className="w-full rounded-xl h-11 bg-success hover:bg-success/90" onClick={handleConfirmDelivery} disabled={isConfirming}>
            {isConfirming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Confirmando...</> : <><CheckCircle2 className="mr-2 h-4 w-4" />Confirmar Recebimento</>}
          </Button>
        )}

        {/* Actions row */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" asChild>
            <Link to="/app/chat"><MessageCircle className="mr-2 h-4 w-4" />Falar com vendedor</Link>
          </Button>
          {canRequestReturn && (
            <Button variant="outline" className="rounded-xl text-warning border-warning/30 hover:bg-warning/5" onClick={() => setShowReturnDialog(true)}>
              <RotateCcw className="mr-2 h-4 w-4" />Devolução
            </Button>
          )}
        </div>

        {/* Return status (compact) */}
        {activeReturn && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50">
            <RotateCcw className="h-4 w-4 text-warning shrink-0" />
            <span className="text-sm flex-1">Devolução: {returnStatusLabels[activeReturn.status]}</span>
            <Badge variant="outline" className="text-xs">{returnStatusLabels[activeReturn.status]}</Badge>
          </div>
        )}

        {/* Store */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <Link to={`/app/store/${order.store?.slug}`} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={order.store?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">{storeInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1"><p className="font-medium text-sm">{order.store?.name}</p><p className="text-xs text-muted-foreground">Ver loja</p></div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3"><CardTitle className="text-base">Itens ({order.order_items?.length || 0})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item) => {
              const imageUrl = item.product?.product_media?.[0]?.url;
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {imageUrl ? <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>}
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{item.title}</p><p className="text-xs text-muted-foreground">Qtd: {item.quantity}</p></div>
                  <p className="text-sm font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                </div>
              );
            })}
            <Separator />
            <div className="space-y-1">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Frete</span><span>{order.shipping_cost === 0 ? 'Grátis' : formatPrice(order.shipping_cost || 0)}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Total</span><span className="text-primary">{formatPrice(order.total)} BYX</span></div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping address */}
        {shippingAddr && (
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <p className="text-sm flex items-center gap-1 mb-1"><MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Entrega</p>
              <p className="text-sm">{shippingAddr.street}, {shippingAddr.number}{shippingAddr.complement && ` - ${shippingAddr.complement}`}</p>
              <p className="text-xs text-muted-foreground">{shippingAddr.city} - {shippingAddr.state}, CEP: {shippingAddr.zipCode}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Return Request Dialog */}
      <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Solicitar Devolução</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Motivo</label>
              <Select value={returnReason} onValueChange={setReturnReason}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Selecione o motivo" /></SelectTrigger>
                <SelectContent>{returnReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
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
              {createReturn.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
