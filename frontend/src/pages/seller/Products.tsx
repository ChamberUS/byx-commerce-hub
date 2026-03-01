import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Package, Search, Filter, MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { useStoreProducts, useUpdateProduct, useDeleteProduct, Product } from '@/hooks/use-products';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function SellerProducts() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: products, isLoading: loadingProducts } = useStoreProducts(store?.id || '');
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);

  if (loadingStore || loadingProducts) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="h-10 w-48 mb-6" />
          <div className="space-y-4">
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

  const filteredProducts = products?.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const statusCounts = {
    all: products?.length || 0,
    active: products?.filter(p => p.status === 'active').length || 0,
    draft: products?.filter(p => p.status === 'draft').length || 0,
    paused: products?.filter(p => p.status === 'paused').length || 0,
    sold: products?.filter(p => p.status === 'sold').length || 0,
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleToggleStatus = async (product: Product) => {
    const newStatus = product.status === 'active' ? 'paused' : 'active';
    try {
      await updateProduct.mutateAsync({ id: product.id, status: newStatus });
      toast({ title: newStatus === 'active' ? 'Anúncio ativado' : 'Anúncio pausado' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      await deleteProduct.mutateAsync(deleteProductId);
      toast({ title: 'Anúncio excluído' });
      setDeleteProductId(null);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao excluir anúncio' });
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-success/10 text-success',
    draft: 'bg-muted text-muted-foreground',
    paused: 'bg-warning/10 text-warning',
    sold: 'bg-primary/10 text-primary',
  };

  const statusLabels: Record<string, string> = {
    active: 'Ativo',
    draft: 'Rascunho',
    paused: 'Pausado',
    sold: 'Vendido',
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/store')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Meus Anúncios</h1>
              <p className="text-xs text-muted-foreground">{products?.length || 0} produtos</p>
            </div>
          </div>
          <Button asChild className="rounded-xl">
            <Link to="/app/store/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo
            </Link>
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar anúncios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>

        {/* Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Todos ({statusCounts.all})</TabsTrigger>
            <TabsTrigger value="active">Ativos ({statusCounts.active})</TabsTrigger>
            <TabsTrigger value="draft">Rascunhos ({statusCounts.draft})</TabsTrigger>
            <TabsTrigger value="paused">Pausados ({statusCounts.paused})</TabsTrigger>
            <TabsTrigger value="sold">Vendidos ({statusCounts.sold})</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Products List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhum anúncio encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter === 'all' 
                ? 'Crie seu primeiro anúncio para começar a vender'
                : 'Nenhum anúncio com este status'}
            </p>
            <Button asChild className="rounded-xl">
              <Link to="/app/store/products/new">
                <Plus className="mr-2 h-4 w-4" />
                Criar Anúncio
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProducts.map((product) => {
              const primaryImage = product.product_media?.find(m => m.is_primary) || product.product_media?.[0];
              
              return (
                <div
                  key={product.id}
                  className="flex gap-4 p-4 rounded-xl bg-card border hover:border-primary/50 transition-colors"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-medium line-clamp-1">{product.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category?.name || 'Sem categoria'}
                        </p>
                      </div>
                      <Badge className={cn('flex-shrink-0', statusColors[product.status])}>
                        {statusLabels[product.status]}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-semibold text-primary">
                        {formatPrice(product.price)} BYX
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Eye className="h-3 w-3" />
                        {product.views_count}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/app/store/products/${product.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleToggleStatus(product)}>
                        {product.status === 'active' ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anúncio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O anúncio será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
