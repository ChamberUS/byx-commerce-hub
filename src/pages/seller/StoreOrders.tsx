import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Package, Clock, CheckCircle2, Truck, 
  Search, MoreVertical, Eye, MessageCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMyStore } from '@/hooks/use-store';
import { useStoreOrders, useUpdateOrderStatus, Order } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const statusConfig = {
  pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary', icon: CheckCircle2 },
  paid: { label: 'Pago', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  shipped: { label: 'Enviado', color: 'bg-primary/10 text-primary', icon: Truck },
  delivered: { label: 'Entregue', color: 'bg-success/10 text-success', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive', icon: Clock },
  refunded: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground', icon: Clock },
};

export default function StoreOrders() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: store, isLoading: loadingStore } = useMyStore();
  
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusDialogOrder, setStatusDialogOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status'] | null>(null);

  const { data: orders, isLoading: loadingOrders } = useStoreOrders(
    store?.id || '',
    statusFilter !== 'all' ? statusFilter : undefined
  );
  const updateOrderStatus = useUpdateOrderStatus();

  if (loadingStore || loadingOrders) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    navigate('/app/store/create');
    return null;
  }

  const filteredOrders = orders?.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      order.order_number.toLowerCase().includes(query) ||
      order.buyer_profile?.nome?.toLowerCase().includes(query)
    );
  }) || [];

  const statusCounts = {
    all: orders?.length || 0,
    pending: orders?.filter(o => o.status === 'pending').length || 0,
    confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
    paid: orders?.filter(o => o.status === 'paid').length || 0,
    shipped: orders?.filter(o => o.status === 'shipped').length || 0,
    delivered: orders?.filter(o => o.status === 'delivered').length || 0,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleStatusChange = async () => {
    if (!statusDialogOrder || !newStatus) return;
    
    try {
      await updateOrderStatus.mutateAsync({
        orderId: statusDialogOrder.id,
        status: newStatus,
      });
      toast({ title: 'Status atualizado!' });
      setStatusDialogOrder(null);
      setNewStatus(null);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
    }
  };

  const getNextStatusOptions = (currentStatus: Order['status']): Order['status'][] => {
    switch (currentStatus) {
      case 'pending': return ['confirmed', 'cancelled'];
      case 'confirmed': return ['paid', 'cancelled'];
      case 'paid': return ['shipped'];
      case 'shipped': return ['delivered'];
      default: return [];
    }
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/app/store')}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Pedidos</h1>
            <p className="text-xs text-muted-foreground">{orders?.length || 0} pedidos</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou comprador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="pending">Pendentes ({statusCounts.pending})</TabsTrigger>
            <TabsTrigger value="paid">Pagos ({statusCounts.paid})</TabsTrigger>
            <TabsTrigger value="shipped">Enviados ({statusCounts.shipped})</TabsTrigger>
            <TabsTrigger value="delivered">Entregues ({statusCounts.delivered})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhum pedido encontrado</h3>
            <p className="text-muted-foreground">
              {statusFilter === 'all' 
                ? 'Você ainda não recebeu pedidos'
                : 'Nenhum pedido com este status'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status];
              const StatusIcon = status.icon;
              const nextStatuses = getNextStatusOptions(order.status);
              
              const buyerInitials = order.buyer_profile?.nome
                ?.split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'C';

              return (
                <div
                  key={order.id}
                  className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={order.buyer_profile?.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                          {buyerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{order.buyer_profile?.nome || 'Comprador'}</p>
                        <p className="text-xs text-muted-foreground">{order.order_number}</p>
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                      <p className="font-semibold text-primary">{formatPrice(order.total)} BYX</p>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-xl">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/app/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalhes
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/app/chat">
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Contatar Comprador
                          </Link>
                        </DropdownMenuItem>
                        {nextStatuses.length > 0 && (
                          <>
                            <DropdownMenuSeparator />
                            {nextStatuses.map((nextStatus) => {
                              const NextIcon = statusConfig[nextStatus].icon;
                              return (
                                <DropdownMenuItem
                                  key={nextStatus}
                                  onClick={() => {
                                    setStatusDialogOrder(order);
                                    setNewStatus(nextStatus);
                                  }}
                                >
                                  <NextIcon className="mr-2 h-4 w-4" />
                                  Marcar como {statusConfig[nextStatus].label}
                                </DropdownMenuItem>
                              );
                            })}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Items preview */}
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      {order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'itens'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Status Change Dialog */}
      <AlertDialog open={!!statusDialogOrder} onOpenChange={() => setStatusDialogOrder(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Atualizar Status</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja marcar o pedido {statusDialogOrder?.order_number} como{' '}
              <strong>{newStatus && statusConfig[newStatus]?.label}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              className="rounded-xl"
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
