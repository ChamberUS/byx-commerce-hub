import { Link } from 'react-router-dom';
import { Bell, TrendingUp, Sparkles, Store } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SectorGrid } from '@/components/marketplace/SectorGrid';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/use-products';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Home() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  const { data: featuredProducts, isLoading: loadingFeatured } = useProducts({ 
    limit: 8, 
    sort_by: 'newest' 
  });
  
  const { data: recentProducts, isLoading: loadingRecent } = useProducts({ 
    limit: 8, 
    sort_by: 'newest' 
  });

  const initials = profile?.nome
    ? profile.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <AppLayout>
      {/* Mobile Header (only on mobile) */}
      {isMobile && (
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">B</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Olá,</p>
                <p className="font-semibold text-sm">
                  {profile?.nome?.split(' ')[0] || 'Usuário'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl relative" asChild>
                <Link to="/app/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
                </Link>
              </Button>
              <Link to="/app/account">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
        {/* Welcome Banner - Desktop Only */}
        {!isMobile && (
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Bem-vindo, {profile?.nome?.split(' ')[0] || 'Usuário'}! 👋
              </h1>
              <p className="text-muted-foreground">
                Descubra produtos incríveis no marketplace BYX
              </p>
            </div>
            <div className="hidden lg:flex gap-3">
              <Button asChild>
                <Link to="/app/search">Explorar Produtos</Link>
              </Button>
              {profile?.tipo_usuario === 'lojista' && (
                <Button variant="outline" asChild>
                  <Link to="/app/seller">
                    <Store className="mr-2 h-4 w-4" />
                    Minha Loja
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Categories/Sectors */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Categorias</h2>
          <SectorGrid />
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Destaques</h2>
            </div>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <Link to="/app/search?sort=popular">Ver todos</Link>
            </Button>
          </div>
          
          {loadingFeatured ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : featuredProducts && featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center">
              <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
              <p className="text-muted-foreground">
                Novos produtos chegando em breve!
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link to="/app/search">Explorar Marketplace</Link>
              </Button>
            </div>
          )}
        </section>

        {/* Recent Products */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Novos Anúncios</h2>
            </div>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <Link to="/app/search?sort=newest">Ver todos</Link>
            </Button>
          </div>
          
          {loadingRecent ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : recentProducts && recentProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentProducts.slice(0, 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-muted/50 p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum produto disponível ainda.
              </p>
              {profile?.tipo_usuario === 'lojista' && (
                <Button className="mt-4" asChild>
                  <Link to="/app/seller/listings/new">Criar Primeiro Anúncio</Link>
                </Button>
              )}
            </div>
          )}
        </section>

        {/* CTA for Sellers */}
        {profile?.tipo_usuario !== 'lojista' && (
          <section className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground text-center">
            <h3 className="text-xl font-bold mb-2">Quer vender no BYX?</h3>
            <p className="text-primary-foreground/80 mb-4">
              Crie sua loja e comece a vender usando BYX
            </p>
            <Button variant="secondary" asChild>
              <Link to="/app/account/edit">Tornar-se Lojista</Link>
            </Button>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
