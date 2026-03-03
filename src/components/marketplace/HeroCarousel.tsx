import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Store, Tag, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/hooks/use-products';

interface HeroSlide {
  id: string;
  type: 'sponsored' | 'top-store' | 'deal' | 'trending';
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  icon: React.ReactNode;
  products?: Product[];
}

interface HeroCarouselProps {
  featuredProducts?: Product[];
  dealsProducts?: Product[];
  userName?: string;
}

export function HeroCarousel({ featuredProducts = [], dealsProducts = [], userName = 'Usuário' }: HeroCarouselProps) {
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides: HeroSlide[] = [
    {
      id: 'sponsored',
      type: 'sponsored',
      title: '🔥 Patrocínios do Dia',
      subtitle: 'As melhores lojas com produtos que mais vendem',
      cta: 'Ver Destaques',
      href: '/app/search?sort=popular',
      gradient: 'from-primary/15 via-primary/5 to-accent/10',
      icon: <Sparkles className="h-5 w-5" />,
      products: featuredProducts.slice(0, 4),
    },
    {
      id: 'deals',
      type: 'deal',
      title: '💰 Ofertas Imperdíveis',
      subtitle: 'Produtos com desconto e que aceitam propostas',
      cta: 'Ver Ofertas',
      href: '/app/search?offers=true',
      gradient: 'from-success/15 via-success/5 to-primary/10',
      icon: <Tag className="h-5 w-5" />,
      products: dealsProducts.slice(0, 4),
    },
    {
      id: 'trending',
      type: 'trending',
      title: '📈 Em Alta no BYX',
      subtitle: 'Produtos mais procurados da semana',
      cta: 'Explorar Tendências',
      href: '/app/search?sort=rating',
      gradient: 'from-warning/15 via-warning/5 to-primary/10',
      icon: <TrendingUp className="h-5 w-5" />,
      products: featuredProducts.slice(2, 6),
    },
    {
      id: 'stores',
      type: 'top-store',
      title: '⭐ Lojas Destaque',
      subtitle: 'Vendedores verificados com as melhores avaliações',
      cta: 'Ver Lojas',
      href: '/app/search?verified=true',
      gradient: 'from-secondary/30 via-secondary/10 to-primary/10',
      icon: <Store className="h-5 w-5" />,
      products: featuredProducts.slice(0, 4),
    },
  ];

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, slides.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, slides.length, goTo]);

  // Auto-advance every 5s
  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price);

  const slide = slides[current];

  return (
    <section className="relative">
      <div
        className={cn(
          'rounded-2xl overflow-hidden border relative',
          'bg-gradient-to-br',
          slide.gradient,
          'border-primary/10',
          'transition-all duration-500 ease-out',
          isMobile ? 'min-h-[200px]' : 'min-h-[220px]'
        )}
      >
        {/* Content */}
        <div className={cn('p-4 md:p-6 flex flex-col h-full relative z-10')}>
          {/* Top row: badge + dots */}
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="text-xs gap-1">
              {slide.icon}
              {slide.type === 'sponsored' && 'Patrocinado'}
              {slide.type === 'deal' && 'Ofertas'}
              {slide.type === 'trending' && 'Tendência'}
              {slide.type === 'top-store' && 'Destaque'}
            </Badge>

            {/* Dots */}
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    i === current
                      ? 'w-6 h-2 bg-primary'
                      : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className={cn(
            'flex flex-col md:flex-row md:items-center gap-4 flex-1',
            'animate-fade-in'
          )}
            key={slide.id} // Force re-render animation
          >
            {/* Text */}
            <div className="flex-1 min-w-0">
              <h2 className={cn(
                'font-bold mb-1',
                isMobile ? 'text-lg' : 'text-xl md:text-2xl'
              )}>
                {slide.title}
              </h2>
              <p className={cn(
                'text-muted-foreground mb-3',
                isMobile ? 'text-xs' : 'text-sm'
              )}>
                {slide.subtitle}
              </p>
              <Button size={isMobile ? 'sm' : 'default'} asChild>
                <Link to={slide.href}>
                  {slide.cta}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {/* Mini product preview cards */}
            {slide.products && slide.products.length > 0 && (
              <div className={cn(
                'flex gap-2 overflow-hidden',
                isMobile ? 'max-w-full' : 'max-w-[380px]'
              )}>
                {slide.products.slice(0, isMobile ? 3 : 4).map((product) => {
                  const img = product.product_media?.find(m => m.is_primary)?.url
                    || product.product_media?.[0]?.url
                    || '/placeholder.svg';
                  return (
                    <Link
                      key={product.id}
                      to={`/app/product/${product.id}`}
                      className={cn(
                        'flex-shrink-0 rounded-xl overflow-hidden bg-card border',
                        'hover:border-primary/40 transition-all hover:shadow-md',
                        'group',
                        isMobile ? 'w-[72px]' : 'w-[84px]'
                      )}
                    >
                      <div className={cn(
                        'aspect-square bg-muted overflow-hidden',
                      )}>
                        <img
                          src={img}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-1.5">
                        <p className="text-[10px] font-bold text-primary truncate">
                          {formatPrice(product.price)} <span className="text-muted-foreground font-normal">BYX</span>
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navigation arrows - desktop only */}
        {!isMobile && (
          <>
            <Button
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm hover:bg-background/80"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
