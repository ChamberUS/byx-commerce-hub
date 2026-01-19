import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Store, Clock, CheckCircle2, 
  Truck, MapPin, MessageCircle, Copy, ExternalLink 
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
import { useOrder } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  pending: { label: 'Aguardando', color: 'bg-warning/10 text-warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary', icon: CheckCircle2 },
  paid: { label: 'Pago', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  shipped: { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: Clock },
  refunded: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground', icon: Clock },
};

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: order, isLoading } = useOrder(id || '');

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(order.order_number);
    toast({ title: 'Número copiado!' });
  };

  const status = statusConfig[order.status];
  const StatusIcon = status.icon;

  const storeInitials = order.store?.name
    ?.split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  const shippingAddr = order.shipping_address as Record<string, string> | null;

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/orders')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Pedido</h1>
              <button onClick={copyOrderNumber} className="text-xs text-muted-foreground flex items-center gap-1">
                {order.order_number}
                <Copy className="h-3 w-3" />
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
        {/* Store */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <Link to={`/app/store/${order.store?.slug}`} className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={order.store?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{order.store?.name}</p>
                <p className="text-sm text-muted-foreground">Ver loja</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status do Pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <TimelineItem
                label="Pedido criado"
                date={order.created_at}
                isActive={true}
              />
              <TimelineItem
                label="Pagamento confirmado"
                date={order.paid_at}
                isActive={!!order.paid_at}
              />
              <TimelineItem
                label="Pedido enviado"
                date={order.shipped_at}
                isActive={!!order.shipped_at}
              />
              <TimelineItem
                label="Pedido entregue"
                date={order.delivered_at}
                isActive={!!order.delivered_at}
                isLast
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens ({order.order_items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {order.order_items?.map((item) => {
              const imageUrl = item.product?.product_media?.[0]?.url;
              
              return (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {imageUrl ? (
                      <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
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
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(order.subtotal)} BYX</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frete</span>
                <span>{order.shipping_cost === 0 ? 'Grátis' : `${formatPrice(order.shipping_cost || 0)} BYX`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(order.total)} BYX</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {shippingAddr && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {shippingAddr.street}, {shippingAddr.number}
                {shippingAddr.complement && ` - ${shippingAddr.complement}`}
              </p>
              <p className="text-sm text-muted-foreground">
                {shippingAddr.neighborhood && `${shippingAddr.neighborhood}, `}
                {shippingAddr.city} - {shippingAddr.state}
              </p>
              <p className="text-sm text-muted-foreground">CEP: {shippingAddr.zipCode}</p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {order.notes && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" asChild>
            <Link to={`/app/chat`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Contatar Vendedor
            </Link>
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}

function TimelineItem({ 
  label, 
  date, 
  isActive, 
  isLast = false 
}: { 
  label: string; 
  date: string | null; 
  isActive: boolean;
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-primary' : 'bg-muted'}`} />
        {!isLast && <div className={`w-0.5 flex-1 mt-1 ${isActive ? 'bg-primary' : 'bg-muted'}`} />}
      </div>
      <div className="pb-4">
        <p className={`text-sm ${isActive ? 'font-medium' : 'text-muted-foreground'}`}>{label}</p>
        {date && (
          <p className="text-xs text-muted-foreground">
            {format(new Date(date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </p>
        )}
      </div>
    </div>
  );
}
