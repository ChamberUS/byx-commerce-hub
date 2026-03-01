 import { useState } from 'react';
 import { Link } from 'react-router-dom';
 import { 
   ArrowLeft, Package, Clock, CheckCircle, XCircle, Truck, 
   Search, Filter, Calendar, ChevronRight, RotateCcw
 } from 'lucide-react';
 import { format } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { AppLayout } from '@/components/layout/AppLayout';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Input } from '@/components/ui/input';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
 } from '@/components/ui/table';
 import { useBuyerOrders, Order } from '@/hooks/use-orders';
 import { cn } from '@/lib/utils';
 
 const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
   pending: { label: 'Pendente', color: 'bg-warning/10 text-warning border-warning/20', icon: Clock },
   confirmed: { label: 'Confirmado', color: 'bg-primary/10 text-primary border-primary/20', icon: CheckCircle },
   paid: { label: 'Pago', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
   shipped: { label: 'Enviado', color: 'bg-primary/10 text-primary border-primary/20', icon: Truck },
   delivered: { label: 'Entregue', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
   cancelled: { label: 'Cancelado', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle },
   refunded: { label: 'Reembolsado', color: 'bg-muted text-muted-foreground border-muted', icon: RotateCcw },
 };
 
 export default function Orders() {
   const { data: orders, isLoading } = useBuyerOrders();
   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('all');
 
   const formatPrice = (price: number) => 
     new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(price);
 
   const filteredOrders = orders?.filter(order => {
     const matchesSearch = !searchQuery || 
       order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
       order.store?.name.toLowerCase().includes(searchQuery.toLowerCase());
     
     const matchesStatus = statusFilter === 'all' ||
       (statusFilter === 'open' && ['pending', 'confirmed', 'paid', 'shipped'].includes(order.status)) ||
       (statusFilter === 'closed' && ['delivered'].includes(order.status)) ||
       (statusFilter === 'cancelled' && ['cancelled', 'refunded'].includes(order.status));
     
     return matchesSearch && matchesStatus;
   }) || [];
 
   const statusCounts = {
     all: orders?.length || 0,
     open: orders?.filter(o => ['pending', 'confirmed', 'paid', 'shipped'].includes(o.status)).length || 0,
     closed: orders?.filter(o => o.status === 'delivered').length || 0,
     cancelled: orders?.filter(o => ['cancelled', 'refunded'].includes(o.status)).length || 0,
   };
 
   if (isLoading) {
     return (
       <AppLayout>
         <div className="max-w-6xl mx-auto px-4 py-6 space-y-4">
           <Skeleton className="h-10 w-48" />
           <Skeleton className="h-12 w-full" />
           <div className="space-y-3">
             {Array.from({ length: 5 }).map((_, i) => (
               <Skeleton key={i} className="h-20 rounded-xl" />
             ))}
           </div>
         </div>
       </AppLayout>
     );
   }
 
   return (
     <AppLayout>
       {/* Header */}
       <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 border-b">
         <div className="max-w-6xl mx-auto px-4">
           <div className="flex items-center justify-between py-4">
             <div className="flex items-center gap-3">
               <Button variant="ghost" size="icon" asChild className="rounded-xl lg:hidden">
                 <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
               </Button>
               <div>
                 <h1 className="text-xl lg:text-2xl font-bold">Meus Pedidos</h1>
                 <p className="text-sm text-muted-foreground hidden sm:block">
                   {orders?.length || 0} pedidos no total
                 </p>
               </div>
             </div>
           </div>
 
           {/* Filters Bar */}
           <div className="flex flex-col sm:flex-row gap-3 pb-4">
             <div className="relative flex-1">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Buscar por pedido ou loja..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 h-10 rounded-xl"
               />
             </div>
             
             <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
               <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                 <TabsTrigger value="all" className="text-xs sm:text-sm">
                   Todos <span className="hidden sm:inline ml-1">({statusCounts.all})</span>
                 </TabsTrigger>
                 <TabsTrigger value="open" className="text-xs sm:text-sm">
                   Abertos <span className="hidden sm:inline ml-1">({statusCounts.open})</span>
                 </TabsTrigger>
                 <TabsTrigger value="closed" className="text-xs sm:text-sm">
                   Concluídos <span className="hidden sm:inline ml-1">({statusCounts.closed})</span>
                 </TabsTrigger>
                 <TabsTrigger value="cancelled" className="text-xs sm:text-sm">
                   Cancelados <span className="hidden sm:inline ml-1">({statusCounts.cancelled})</span>
                 </TabsTrigger>
               </TabsList>
             </Tabs>
           </div>
         </div>
       </header>
 
       <div className="max-w-6xl mx-auto px-4 py-6">
         {filteredOrders.length === 0 ? (
           <div className="text-center py-16 bg-card rounded-xl border">
             <Package className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
             <h2 className="text-xl font-semibold mb-2">
               {searchQuery || statusFilter !== 'all' ? 'Nenhum pedido encontrado' : 'Nenhum pedido ainda'}
             </h2>
             <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
               {searchQuery || statusFilter !== 'all' 
                 ? 'Tente ajustar os filtros para ver mais resultados.'
                 : 'Quando você fizer compras, seus pedidos aparecerão aqui.'}
             </p>
             <Button asChild className="rounded-xl">
               <Link to="/app/search">Explorar Marketplace</Link>
             </Button>
           </div>
         ) : (
           <>
             {/* Desktop Table */}
             <div className="hidden lg:block bg-card rounded-xl border overflow-hidden">
               <Table>
                 <TableHeader>
                   <TableRow className="bg-muted/50">
                     <TableHead className="w-[200px]">Pedido</TableHead>
                     <TableHead>Loja</TableHead>
                     <TableHead>Data</TableHead>
                     <TableHead>Status</TableHead>
                     <TableHead className="text-right">Total</TableHead>
                     <TableHead className="w-[50px]"></TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {filteredOrders.map((order) => {
                     const status = statusConfig[order.status];
                     const StatusIcon = status.icon;
                     
                     return (
                       <TableRow key={order.id} className="group hover:bg-muted/30">
                         <TableCell>
                           <div className="font-mono text-sm">{order.order_number}</div>
                           <div className="text-xs text-muted-foreground">
                             {order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'itens'}
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-3">
                             <Avatar className="h-8 w-8">
                               <AvatarImage src={order.store?.logo_url || undefined} />
                               <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                 {order.store?.name?.[0]}
                               </AvatarFallback>
                             </Avatar>
                             <span className="font-medium">{order.store?.name}</span>
                           </div>
                         </TableCell>
                         <TableCell>
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <Calendar className="h-4 w-4" />
                             {format(new Date(order.created_at), "dd MMM yyyy", { locale: ptBR })}
                           </div>
                         </TableCell>
                         <TableCell>
                           <Badge variant="outline" className={cn('gap-1.5 font-medium', status.color)}>
                             <StatusIcon className="h-3.5 w-3.5" />
                             {status.label}
                           </Badge>
                         </TableCell>
                         <TableCell className="text-right">
                           <div className="font-semibold">{formatPrice(order.total)}</div>
                           <div className="text-xs text-muted-foreground">BYX</div>
                         </TableCell>
                         <TableCell>
                           <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100">
                             <Link to={`/app/orders/${order.id}`}>
                               <ChevronRight className="h-4 w-4" />
                             </Link>
                           </Button>
                         </TableCell>
                       </TableRow>
                     );
                   })}
                 </TableBody>
               </Table>
             </div>
 
             {/* Mobile Cards */}
             <div className="lg:hidden space-y-3">
               {filteredOrders.map((order) => {
                 const status = statusConfig[order.status];
                 const StatusIcon = status.icon;
                 
                 return (
                   <Link
                     key={order.id}
                     to={`/app/orders/${order.id}`}
                     className="block p-4 rounded-xl bg-card border hover:border-primary/50 transition-all hover:shadow-md"
                   >
                     <div className="flex items-start justify-between gap-3 mb-3">
                       <div className="flex items-center gap-3">
                         <Avatar className="h-10 w-10">
                           <AvatarImage src={order.store?.logo_url || undefined} />
                           <AvatarFallback className="bg-primary/10 text-primary">
                             {order.store?.name?.[0]}
                           </AvatarFallback>
                         </Avatar>
                         <div>
                           <p className="font-medium">{order.store?.name}</p>
                           <p className="text-xs text-muted-foreground font-mono">{order.order_number}</p>
                         </div>
                       </div>
                       <Badge variant="outline" className={cn('gap-1', status.color)}>
                         <StatusIcon className="h-3 w-3" />
                         {status.label}
                       </Badge>
                     </div>
                     
                     <div className="flex items-center justify-between pt-3 border-t">
                       <div className="flex items-center gap-4 text-sm text-muted-foreground">
                         <span>{order.order_items?.length || 0} {(order.order_items?.length || 0) === 1 ? 'item' : 'itens'}</span>
                         <span>{format(new Date(order.created_at), "dd/MM/yy", { locale: ptBR })}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="font-bold text-primary">{formatPrice(order.total)} BYX</span>
                         <ChevronRight className="h-4 w-4 text-muted-foreground" />
                       </div>
                     </div>
                   </Link>
                 );
               })}
             </div>
           </>
         )}
       </div>
     </AppLayout>
   );
 }
