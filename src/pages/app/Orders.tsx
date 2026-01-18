import { Link } from 'react-router-dom';
import { ArrowLeft, Package, ShoppingCart, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useBuyerOrders } from '@/hooks/use-orders';
import { cn } from '@/lib/utils';

export default function Orders() {
  const { data: orders, isLoading } = useBuyerOrders();

  const statusIcons: Record<string, React.ReactNode> = {
    pending: <Clock className="h-4 w-4" />,
    confirmed: <CheckCircle className="h-4 w-4" />,
    paid: <CheckCircle className="h-4 w-4" />,
    shipped: <Truck className="h-4 w-4" />,
    delivered: <CheckCircle className="h-4 w-4" />,
    cancelled: <XCircle className="h-4 w-4" />,
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-primary/10 text-primary',
    paid: 'bg-success/10 text-success',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(price);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl mb-4" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-lg font-semibold">Meus Pedidos</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum pedido ainda</h2>
            <p className="text-muted-foreground mb-4">Seus pedidos aparecerão aqui</p>
            <Button asChild><Link to="/app/search">Explorar Marketplace</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/app/orders/${order.id}`}
                className="block p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={order.store?.logo_url || undefined} />
                      <AvatarFallback>{order.store?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{order.store?.name}</p>
                      <p className="text-xs text-muted-foreground">{order.order_number}</p>
                    </div>
                  </div>
                  <Badge className={cn('gap-1', statusColors[order.status])}>
                    {statusIcons[order.status]}
                    {statusLabels[order.status]}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {order.order_items?.length} {order.order_items?.length === 1 ? 'item' : 'itens'}
                  </p>
                  <p className="font-semibold text-primary">{formatPrice(order.total)} BYX</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
