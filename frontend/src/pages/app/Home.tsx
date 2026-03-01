import { Link } from 'react-router-dom';
import { Bell, TrendingUp, Sparkles, Store, BadgeCheck, ShoppingBag, Package, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { SectorGrid } from '@/components/marketplace/SectorGrid';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { VerifiedStoresSection } from '@/components/marketplace/VerifiedStoresSection';
import { TrustSignals } from '@/components/marketplace/TrustSignals';
import { CryptoUSPBanner } from '@/components/marketplace/CryptoUSPBanner';
import { SponsoredCarousel, DealsCarousel, TrendingCarousel } from '@/components/marketplace/CarouselSection';
import { WalletMiniWidget } from '@/components/wallet/WalletMiniWidget';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/hooks/use-products';
import { useIsMobile } from '@/hooks/use-mobile';
import { EmptyStateCard } from '@/components/common/EmptyStateCard';
import { getProductGrid, getSection } from '@/lib/responsive-constants';
import { cn } from '@/lib/utils';

export default function Home() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  
  // Fetch multiple product sets for different sections
  const { data: featuredProducts, isLoading: loadingFeatured } = useProducts({ 
    limit: 12, 
    sort_by: 'rating' 
  });
  
  const { data: recentProducts, isLoading: loadingRecent } = useProducts({ 
    limit: 12, 
    sort_by: 'newest' 
  });

  // Simular "ofertas do dia" (produtos com allow_offers)
  const { data: dealsProducts, isLoading: loadingDeals } = useProducts({
    limit: 12,
    allow_offers: true,
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

  const firstName = profile?.nome?.split(' ')[0] || 'Usuário';

  return (
    <AppLayout>
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
                <span className="text-sm font-bold text-primary-foreground">B</span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Olá,</p>
                <p className="font-semibold text-sm">{firstName}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <WalletMiniWidget compact />
              <Button variant="ghost" size="icon" className="rounded-xl relative" asChild>
                <Link to="/app/account/notifications">
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
      <div className={cn(
        'max-w-7xl mx-auto px-4 py-6',
        getSection()
      )}>
        {/* Welcome Banner - MOBILE E DESKTOP */}
        <section className={cn(
          'rounded-2xl overflow-hidden border',
          'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
          'border-primary/10'
        )}>
          <div className={cn(
            'p-4 md:p-6',
            'flex flex-col md:flex-row md:items-center md:justify-between gap-4'
          )}>
            <div className="flex-1">
              <h1 className="text-xl md:text-2xl font-bold mb-1">
                Olá, {firstName}! 👋
              </h1>
              <p className="text-sm md:text-base text-muted-foreground">
                Descubra produtos incríveis no marketplace BYX
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/app/search">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Explorar Produtos
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <Link to="/app/orders">
                  <Package className="mr-2 h-4 w-4" />
                  Meus Pedidos
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Banner AIOS (melhorado) */}
        <CryptoUSPBanner />

        {/* eBay-style Carousels */}
        {!loadingFeatured && featuredProducts && featuredProducts.length > 0 && (
          <SponsoredCarousel products={featuredProducts.slice(0, 8)} />
        )}

        {!loadingDeals && dealsProducts && dealsProducts.length > 0 && (
          <DealsCarousel products={dealsProducts.slice(0, 8)} />
        )}

        {!loadingFeatured && featuredProducts && featuredProducts.length > 0 && (
          <TrendingCarousel products={featuredProducts.slice(0, 8)} />
        )}

        {/* Categories/Sectors */}
        <section>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Categorias</h2>
          <SectorGrid />
        </section>

        {/* Novidades (Seção Grid Tradicional) */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-lg md:text-xl font-semibold">Novidades</h2>
            </div>
            <Button variant="link" size="sm" className="text-primary" asChild>
              <Link to="/app/search?sort=newest">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          
          {loadingRecent ? (
            <div className={getProductGrid()}>
              {Array.from({ length: isMobile ? 4 : 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : recentProducts && recentProducts.length > 0 ? (
            <div className={getProductGrid()}>
              {recentProducts.slice(0, isMobile ? 4 : 8).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <EmptyStateCard
              icon={ShoppingBag}
              title="Nenhum produto disponível"
              description="Seja o primeiro a anunciar! Crie sua loja e comece a vender no BYX."
              actionLabel={profile?.tipo_usuario === 'lojista' ? 'Criar Primeiro Anúncio' : 'Tornar-se Lojista'}
              actionHref={profile?.tipo_usuario === 'lojista' ? '/app/store/products/new' : '/app/account/edit'}
            />
          )}
        </section>

        {/* Lojas Verificadas */}
        <VerifiedStoresSection />

        {/* Trust Signals */}
        <TrustSignals />

        {/* CTA for Sellers */}
        {profile?.tipo_usuario !== 'lojista' && (
          <section className={cn(
            'rounded-2xl overflow-hidden',
            'bg-gradient-to-r from-primary to-primary/80',
            'text-primary-foreground text-center',
            'p-6 md:p-8'
          )}>
            <h3 className="text-xl md:text-2xl font-bold mb-2">Quer vender no BYX?</h3>
            <p className="text-primary-foreground/90 mb-4 text-sm md:text-base">
              Crie sua loja e comece a vender usando BYX
            </p>
            <Button variant="secondary" size="lg" asChild className="min-h-[44px]">
              <Link to="/app/account/edit">Tornar-se Lojista</Link>
            </Button>
          </section>
        )}

        {/* Footer Links */}
        <footer className="border-t pt-8 pb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <h4 className="font-semibold mb-3">Marketplace</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/app/search" className="hover:text-foreground">Explorar</Link></li>
                <li><Link to="/app/search?verified=true" className="hover:text-foreground">Lojas Verificadas</Link></li>
                <li><Link to="/app/search?offers=true" className="hover:text-foreground">Aceita Ofertas</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Sua Conta</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/app/orders" className="hover:text-foreground">Meus Pedidos</Link></li>
                <li><Link to="/app/favorites" className="hover:text-foreground">Favoritos</Link></li>
                <li><Link to="/app/wallet" className="hover:text-foreground">Carteira</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Vender</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/app/store/create" className="hover:text-foreground">Criar Loja</Link></li>
                <li><Link to="/app/store" className="hover:text-foreground">Seller Hub</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/legal/terms" className="hover:text-foreground">Termos de Uso</Link></li>
                <li><Link to="/legal/privacy" className="hover:text-foreground">Privacidade</Link></li>
                <li><Link to="/app/faq" className="hover:text-foreground">FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} BYX. Todos os direitos reservados.</p>
          </div>
        </footer>
      </div>
    </AppLayout>
  );
}
