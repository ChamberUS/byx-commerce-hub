import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/hooks/use-products';

interface CarouselSectionProps {
  title: string;
  products: Product[];
  icon?: React.ReactNode;
  badge?: string;
  viewAllHref?: string;
}

export function CarouselSection({ 
  title, 
  products, 
  icon, 
  badge,
  viewAllHref = '/app/search' 
}: CarouselSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const isMobile = useIsMobile();

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScrollButtons();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollButtons);
      return () => ref.removeEventListener('scroll', checkScrollButtons);
    }
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    
    const scrollAmount = isMobile ? 280 : 320;
    const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
    
    scrollRef.current.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon && <div className="text-primary">{icon}</div>}
          <h2 className="text-lg md:text-xl font-semibold">{title}</h2>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link to={viewAllHref}>Ver todos</Link>
        </Button>
      </div>

      {/* Carousel */}
      <div className="relative group">
        {/* Left Arrow - Desktop only */}
        {!isMobile && canScrollLeft && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => (
            <CarouselCard key={product.id} product={product} />
          ))}
        </div>

        {/* Right Arrow - Desktop only */}
        {!isMobile && canScrollRight && (
          <Button
            size="icon"
            variant="secondary"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// CAROUSEL CARD (Horizontal Card eBay-style)
// ============================================================================

interface CarouselCardProps {
  product: Product;
}

function CarouselCard({ product }: CarouselCardProps) {
  const primaryImage = product.product_media?.find(m => m.is_primary)?.url 
    || product.product_media?.[0]?.url
    || '/placeholder.svg';

  const conditionLabels = {
    new: 'Novo',
    used: 'Usado',
    refurbished: 'Recondicionado',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <Link
      to={`/app/product/${product.id}`}
      className={cn(
        'flex-shrink-0 w-[260px] md:w-[300px] snap-start',
        'bg-card rounded-xl border overflow-hidden',
        'transition-all hover:shadow-lg hover:border-primary/30',
        'group'
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary" className="text-xs">
            {conditionLabels[product.condition]}
          </Badge>
          {product.allow_offers && (
            <Badge className="text-xs bg-success text-success-foreground">
              <Tag className="h-3 w-3 mr-1" />
              Oferta
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">BYX</span>
        </div>

        {/* Store */}
        {product.store && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
            {product.store.name}
          </p>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// SPECIALIZED CAROUSELS
// ============================================================================

interface SponsoredCarouselProps {
  products: Product[];
}

export function SponsoredCarousel({ products }: SponsoredCarouselProps) {
  return (
    <CarouselSection
      title="Patrocínios do mês"
      products={products}
      icon={<Sparkles className="h-5 w-5" />}
      badge="Em alta"
      viewAllHref="/app/search?sort=popular"
    />
  );
}

interface DealsCarouselProps {
  products: Product[];
}

export function DealsCarousel({ products }: DealsCarouselProps) {
  return (
    <CarouselSection
      title="Ofertas do dia"
      products={products}
      icon={<Tag className="h-5 w-5" />}
      badge="Limitado"
      viewAllHref="/app/search?offers=true"
    />
  );
}

interface TrendingCarouselProps {
  products: Product[];
}

export function TrendingCarousel({ products }: TrendingCarouselProps) {
  return (
    <CarouselSection
      title="Melhores anúncios"
      products={products}
      icon={<TrendingUp className="h-5 w-5" />}
      viewAllHref="/app/search?sort=rating"
    />
  );
}
