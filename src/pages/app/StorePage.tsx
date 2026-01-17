import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Heart, Globe, Instagram, MessageCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useStore } from '@/hooks/use-store';
import { useProducts } from '@/hooks/use-products';
import { useToggleFavoriteStore } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

export default function StorePage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const { data: store, isLoading: loadingStore } = useStore(slug || '');
  const { data: products, isLoading: loadingProducts } = useProducts(
    store ? { limit: 20 } : {}
  );
  const toggleFavorite = useToggleFavoriteStore();

  // Filter products by store
  const storeProducts = products?.filter(p => p.store_id === store?.id) || [];

  if (loadingStore) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="h-32 rounded-2xl mb-6" />
          <Skeleton className="h-20 w-20 rounded-full mx-auto -mt-16 mb-4" />
          <Skeleton className="h-6 w-1/3 mx-auto mb-2" />
          <Skeleton className="h-4 w-1/4 mx-auto" />
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Loja não encontrada</h2>
          <p className="text-muted-foreground mb-4">Esta loja pode ter sido desativada ou não existe.</p>
          <Button asChild>
            <Link to="/app/search">Voltar ao Marketplace</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const initials = store.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Banner */}
        <div className="relative h-32 md:h-48 bg-gradient-to-br from-primary/20 to-primary/5">
          {store.banner_url && (
            <img
              src={store.banner_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Store Info */}
        <div className="px-4 -mt-12 mb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage src={store.logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{store.name}</h1>
                {store.is_verified && (
                  <Badge className="bg-primary">Verificada</Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {store.rating_count > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    {store.rating_avg.toFixed(1)} ({store.rating_count} avaliações)
                  </span>
                )}
                {store.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {store.city}{store.state && `, ${store.state}`}
                  </span>
                )}
                <span>{store.total_sales} vendas</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => user && toggleFavorite.mutate(store.id)}
              >
                <Heart className="h-5 w-5" />
              </Button>
              <Button>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contato
              </Button>
            </div>
          </div>

          {/* Description */}
          {store.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {store.description}
            </p>
          )}

          {/* Social Links */}
          <div className="flex gap-3 mt-4">
            {store.instagram && (
              <a 
                href={`https://instagram.com/${store.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Instagram className="h-4 w-4" />
                @{store.instagram}
              </a>
            )}
            {store.website && (
              <a 
                href={store.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Globe className="h-4 w-4" />
                Website
              </a>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="px-4 py-6 border-t">
          <Tabs defaultValue="products">
            <TabsList className="mb-6">
              <TabsTrigger value="products">Produtos ({storeProducts.length})</TabsTrigger>
              <TabsTrigger value="about">Sobre</TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              {loadingProducts ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                  ))}
                </div>
              ) : storeProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {storeProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    Esta loja ainda não tem produtos publicados.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="about">
              <div className="max-w-2xl space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Sobre a loja</h3>
                  <p className="text-muted-foreground">
                    {store.description || 'Sem descrição disponível.'}
                  </p>
                </div>
                
                {(store.city || store.state) && (
                  <div>
                    <h3 className="font-semibold mb-2">Localização</h3>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {store.city}{store.state && `, ${store.state}`}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-2">Estatísticas</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-primary">{store.total_sales}</p>
                      <p className="text-sm text-muted-foreground">Vendas</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-primary">{storeProducts.length}</p>
                      <p className="text-sm text-muted-foreground">Produtos</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-2xl font-bold text-primary">
                        {store.rating_count > 0 ? store.rating_avg.toFixed(1) : '-'}
                      </p>
                      <p className="text-sm text-muted-foreground">Avaliação</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
