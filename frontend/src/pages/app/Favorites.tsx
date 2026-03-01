import { Link } from 'react-router-dom';
import { Heart, Store, ArrowLeft, Trash2 } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { StoreCard } from '@/components/marketplace/StoreCard';
import { useFavoriteProducts, useFavoriteStores, useToggleFavoriteStore } from '@/hooks/use-favorites';
import type { Product } from '@/hooks/use-products';

export default function FavoritesPage() {
  const { data: favoriteProducts, isLoading: loadingProducts } = useFavoriteProducts();
  const { data: favoriteStores, isLoading: loadingStores } = useFavoriteStores();
  const toggleFavoriteStore = useToggleFavoriteStore();

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/app">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Favoritos</h1>
            <p className="text-muted-foreground">Seus produtos e lojas salvos</p>
          </div>
        </div>

        <Tabs defaultValue="products">
          <TabsList className="mb-6">
            <TabsTrigger value="products" className="gap-2">
              <Heart className="h-4 w-4" />
              Produtos ({favoriteProducts?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="stores" className="gap-2">
              <Store className="h-4 w-4" />
              Lojas ({favoriteStores?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {loadingProducts ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                ))}
              </div>
            ) : favoriteProducts && favoriteProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {favoriteProducts.map((fav) => (
                  fav.product && (
                    <ProductCard 
                      key={fav.id} 
                      product={fav.product as unknown as Product} 
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhum produto favorito</h3>
                <p className="text-muted-foreground mb-4">
                  Clique no coração nos produtos para salvá-los aqui
                </p>
                <Button asChild>
                  <Link to="/app/search">Explorar Produtos</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="stores">
            {loadingStores ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-40 rounded-2xl" />
                ))}
              </div>
            ) : favoriteStores && favoriteStores.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favoriteStores.map((fav) => (
                  fav.store && (
                    <StoreCard 
                      key={fav.id} 
                      store={fav.store as any} 
                      showFavorite
                      isFavorite
                      onFavorite={() => toggleFavoriteStore.mutate(fav.store_id)}
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Nenhuma loja favorita</h3>
                <p className="text-muted-foreground mb-4">
                  Siga suas lojas preferidas para acompanhar novidades
                </p>
                <Button asChild>
                  <Link to="/app/search">Explorar Lojas</Link>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
