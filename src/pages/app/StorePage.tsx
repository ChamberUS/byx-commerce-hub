import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star, MapPin, Heart, Globe, Instagram, MessageCircle,
  Share2, Search, ChevronLeft, ChevronRight, ExternalLink,
  Package, ShoppingBag, Users, Pause, Play
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: store, isLoading: loadingStore } = useStore(slug || '');
  const { data: products, isLoading: loadingProducts } = useProducts(
    store ? { limit: 50 } : {}
  );
  const toggleFavorite = useToggleFavoriteStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [bannerIndex, setBannerIndex] = useState(0);

  const storeProducts = products?.filter(p => p.store_id === store?.id) || [];
  const filteredProducts = searchQuery
    ? storeProducts.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : storeProducts;

  // Mock banners - in production these would come from store customization
  const banners = store?.banner_url ? [store.banner_url] : [];

  if (loadingStore) {
    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto">
          <Skeleton className="h-48 md:h-64" />
          <div className="px-4 py-4">
            <div className="flex gap-4">
              <Skeleton className="h-20 w-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
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
          <Button asChild><Link to="/app/search">Voltar ao Marketplace</Link></Button>
        </div>
      </AppLayout>
    );
  }

  const initials = store.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

  const stats = [
    { label: 'de feedback positivo', value: store.rating_count > 0 ? `${(store.rating_avg * 20).toFixed(1)}%` : '-' },
    { label: 'de itens vendidos', value: store.total_sales > 0 ? store.total_sales.toLocaleString('pt-BR') : '0' },
    { label: 'produtos', value: storeProducts.length.toString() },
  ];

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        {/* Banner Carousel */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-muted overflow-hidden">
          {banners.length > 0 ? (
            <>
              <img
                src={banners[bannerIndex]}
                alt=""
                className="w-full h-full object-cover"
              />
              {banners.length > 1 && (
                <>
                  <Button
                    size="icon" variant="secondary"
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 opacity-80"
                    onClick={() => setBannerIndex(i => i > 0 ? i - 1 : banners.length - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon" variant="secondary"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 opacity-80"
                    onClick={() => setBannerIndex(i => i < banners.length - 1 ? i + 1 : 0)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  {/* Dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {banners.map((_, i) => (
                      <button
                        key={i}
                        className={cn('h-2 rounded-full transition-all', i === bannerIndex ? 'w-6 bg-primary' : 'w-2 bg-background/60')}
                        onClick={() => setBannerIndex(i)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/20" />
            </div>
          )}
        </div>

        {/* Store Header - eBay style */}
        <div className="border-b">
          <div className="px-4 md:px-6 py-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* Logo + Info */}
              <div className="flex items-center gap-4 flex-1">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-background shadow-md -mt-10 md:-mt-12 bg-card">
                  <AvatarImage src={store.logo_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold">{store.name}</h1>
                    {store.is_verified && (
                      <Badge className="bg-primary text-xs">Verificada</Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 mt-1 text-sm text-muted-foreground">
                    {stats.map((stat, i) => (
                      <span key={i}>
                        <strong className="text-foreground">{stat.value}</strong>{' '}
                        {stat.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="outline" size="sm" className="rounded-xl gap-2" asChild>
                  <a href={`https://wa.me/${store.whatsapp}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    Contatar
                  </a>
                </Button>
                <Button
                  variant="outline" size="sm" className="rounded-xl gap-2"
                  onClick={() => user && toggleFavorite.mutate(store.id)}
                >
                  <Heart className="h-4 w-4" />
                  Salvar vendedor
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs + Search - eBay style */}
          <div className="px-4 md:px-6 flex flex-col md:flex-row md:items-center gap-3 pb-3">
            <Tabs defaultValue="products" className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-3 w-full">
                <TabsList className="h-auto p-0 bg-transparent gap-0">
                  <TabsTrigger
                    value="products"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm"
                  >
                    Fazer compras
                  </TabsTrigger>
                  <TabsTrigger
                    value="about"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm"
                  >
                    Sobre
                  </TabsTrigger>
                  <TabsTrigger
                    value="feedback"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-sm"
                  >
                    Feedback
                  </TabsTrigger>
                </TabsList>

                {/* Search within store */}
                <div className="relative md:ml-auto w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Pesquisar os ${storeProducts.length} itens`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-9 rounded-full border text-sm"
                  />
                </div>
              </div>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                {loadingProducts ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                    ))}
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `Nenhum resultado para "${searchQuery}"`
                        : 'Esta loja ainda não tem produtos publicados.'
                      }
                    </p>
                    {searchQuery && (
                      <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                        Limpar busca
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* About Tab */}
              <TabsContent value="about" className="mt-6">
                <div className="max-w-2xl space-y-6">
                  {store.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Sobre a loja</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{store.description}</p>
                    </div>
                  )}

                  {(store.city || store.state) && (
                    <div>
                      <h3 className="font-semibold mb-2">Localização</h3>
                      <p className="text-muted-foreground text-sm flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {store.city}{store.state && `, ${store.state}`}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {store.instagram && (
                      <a
                        href={`https://instagram.com/${store.instagram}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Instagram className="h-4 w-4" />@{store.instagram}
                      </a>
                    )}
                    {store.website && (
                      <a
                        href={store.website}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                      >
                        <Globe className="h-4 w-4" />Website
                      </a>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Estatísticas</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-primary">{store.total_sales}</p>
                        <p className="text-xs text-muted-foreground">Vendas</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-primary">{storeProducts.length}</p>
                        <p className="text-xs text-muted-foreground">Produtos</p>
                      </div>
                      <div className="p-4 rounded-xl bg-muted/50 text-center">
                        <p className="text-2xl font-bold text-primary">
                          {store.rating_count > 0 ? store.rating_avg.toFixed(1) : '-'}
                        </p>
                        <p className="text-xs text-muted-foreground">Avaliação</p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="mt-6">
                <div className="text-center py-16">
                  <Star className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="font-medium mb-1">Nenhum feedback ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Feedbacks dos compradores aparecerão aqui.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
