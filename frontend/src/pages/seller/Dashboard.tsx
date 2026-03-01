import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ShoppingCart, Users, TrendingUp, Plus, Settings,
  ChevronRight, Wallet, ArrowUpRight, ArrowDownRight, Store,
  MessageCircle, Zap
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyStore } from '@/hooks/use-store';
import { useStoreProducts } from '@/hooks/use-products';
import { useStoreOrders } from '@/hooks/use-orders';
import { useAiosBalance } from '@/hooks/use-aios';
import { DemoDataButton } from '@/components/common/DemoDataButton';
import { cn } from '@/lib/utils';

export default function SellerDashboard() {
  const navigate = useNavigate();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: products } = useStoreProducts(store?.id || '');
  const { data: orders } = useStoreOrders(store?.id || '');
  const { data: aiosBalance } = useAiosBalance(store?.id || '');

  if (loadingStore) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="h-32 rounded-2xl mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Crie sua loja</h2>
          <p className="text-muted-foreground mb-6">
            Você ainda não tem uma loja. Crie agora e comece a vender no BYX!
          </p>
          <Button asChild size="lg" className="rounded-xl">
            <Link to="/app/store/create">
              <Plus className="mr-2 h-5 w-5" />
              Criar Minha Loja
            </Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const activeProducts = products?.filter(p => p.status === 'active').length || 0;
  const pendingOrders = orders?.filter(o => ['pending', 'confirmed', 'paid'].includes(o.status)).length || 0;
  const recentOrders = orders?.slice(0, 5) || [];

  // Calculate sales
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const sales7d = orders?.filter(o => 
    o.status !== 'cancelled' && 
    o.status !== 'refunded' && 
    new Date(o.created_at) >= weekAgo
  ).reduce((sum, o) => sum + o.total, 0) || 0;

  const sales30d = orders?.filter(o =>
    o.status !== 'cancelled' &&
    o.status !== 'refunded' &&
    new Date(o.created_at) >= monthAgo
  ).reduce((sum, o) => sum + o.total, 0) || 0;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-warning/10 text-warning',
    confirmed: 'bg-primary/10 text-primary',
    paid: 'bg-success/10 text-success',
    shipped: 'bg-primary/10 text-primary',
    delivered: 'bg-success/10 text-success',
    cancelled: 'bg-destructive/10 text-destructive',
    refunded: 'bg-muted text-muted-foreground',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    confirmed: 'Confirmado',
    paid: 'Pago',
    shipped: 'Enviado',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado',
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Store Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-primary/20">
              <AvatarImage src={store.logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                {store.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl font-bold">{store.name}</h1>
              <p className="text-sm text-muted-foreground">
                {store.city}, {store.state}
              </p>
            </div>
          </div>
          <Button variant="outline" size="icon" className="rounded-xl" asChild>
            <Link to="/app/store/edit">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 overflow-x-auto pb-2">
          <Button asChild className="rounded-xl">
            <Link to="/app/store/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Anúncio
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/app/store/orders">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ver Pedidos
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/app/chat">
              <MessageCircle className="mr-2 h-4 w-4" />
              Mensagens
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-xl">
            <Link to="/app/store/quick-replies">
              <Zap className="mr-2 h-4 w-4" />
              Respostas
            </Link>
          </Button>
          <DemoDataButton />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-xs text-muted-foreground">7 dias</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(sales7d)}</p>
              <p className="text-xs text-muted-foreground">BYX em vendas</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">30 dias</span>
              </div>
              <p className="text-2xl font-bold">{formatPrice(sales30d)}</p>
              <p className="text-xs text-muted-foreground">BYX em vendas</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-warning" />
                <span className="text-xs text-muted-foreground">Pendentes</span>
              </div>
              <p className="text-2xl font-bold">{pendingOrders}</p>
              <p className="text-xs text-muted-foreground">pedidos</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-primary" />
                <span className="text-xs text-muted-foreground">Ativos</span>
              </div>
              <p className="text-2xl font-bold">{activeProducts}</p>
              <p className="text-xs text-muted-foreground">anúncios</p>
            </CardContent>
          </Card>
        </div>

        {/* AIOS Balance */}
        <Card className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Wallet className="h-5 w-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Saldo AIOS</span>
                </div>
                <p className="text-3xl font-bold text-primary">
                  {formatPrice(aiosBalance?.balance || 0)} BYX
                </p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1 text-success">
                    <ArrowUpRight className="h-4 w-4" />
                    {formatPrice(aiosBalance?.total_earned || 0)} ganhos
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <ArrowDownRight className="h-4 w-4" />
                    {formatPrice(aiosBalance?.total_withdrawn || 0)} sacados
                  </span>
                </div>
              </div>
              <Button variant="secondary" className="rounded-xl" asChild>
                <Link to="/app/store/analytics">
                  Ver detalhes
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Últimos Pedidos</CardTitle>
            <Button variant="link" size="sm" asChild>
              <Link to="/app/store/orders">Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/app/store/orders/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.buyer_profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-muted text-xs">
                          {order.buyer_profile?.nome?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{order.order_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.buyer_profile?.nome || 'Cliente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatPrice(order.total)} BYX</p>
                      <Badge className={cn('text-xs', statusColors[order.status])}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link
            to="/app/store/products"
            className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
          >
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Meus Anúncios</h3>
            <p className="text-sm text-muted-foreground">{products?.length || 0} produtos</p>
          </Link>

          <Link
            to="/app/store/orders"
            className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
          >
            <ShoppingCart className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Pedidos</h3>
            <p className="text-sm text-muted-foreground">{orders?.length || 0} pedidos</p>
          </Link>

          <Link
            to="/app/store/customers"
            className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
          >
            <Users className="h-6 w-6 text-primary mb-2" />
            <h3 className="font-semibold">Clientes</h3>
            <p className="text-sm text-muted-foreground">Em breve</p>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
