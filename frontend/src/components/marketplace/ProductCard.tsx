import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToggleFavoriteProduct, useIsProductFavorite } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Product } from '@/hooks/use-products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const { data: isFavorite } = useIsProductFavorite(product.id);
  const toggleFavorite = useToggleFavoriteProduct();

  const primaryImage = product.product_media?.find(m => m.is_primary)?.url 
    || product.product_media?.[0]?.url
    || '/placeholder.svg';

  const conditionLabels = {
    new: 'Novo',
    used: 'Usado',
    refurbished: 'Recondicionado',
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
      toggleFavorite.mutate(product.id);
    }
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
        'group block bg-card rounded-2xl border overflow-hidden',
        'transition-all hover:shadow-lg hover:border-primary/30',
        // Touch-friendly no mobile
        'active:scale-[0.98]',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        
        {/* Favorite Button - Touch optimized */}
        {user && (
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'absolute rounded-full shadow-md backdrop-blur-sm',
              // Mobile: maior e melhor posicionado
              isMobile ? 'top-2 right-2 h-9 w-9' : 'top-2 right-2 h-8 w-8',
              isFavorite && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn(
              isMobile ? 'h-5 w-5' : 'h-4 w-4',
              isFavorite && 'fill-current'
            )} />
          </Button>
        )}

        {/* Badges - Mobile optimized */}
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-1">
          <Badge
            variant="secondary"
            className={cn('backdrop-blur-sm', isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs')}
          >
            {conditionLabels[product.condition]}
          </Badge>

          {product.allow_offers && (
            <Badge
              className={cn(
                'bg-success/90 text-success-foreground backdrop-blur-sm',
                isMobile ? 'text-[10px] px-1.5 py-0.5' : 'text-xs'
              )}
            >
              Aceita oferta
            </Badge>
          )}
        </div>
      </div>

      {/* Content - Padding responsivo */}
      <div className={cn(isMobile ? 'p-2.5' : 'p-3')}>
        <h3 className={cn(
          'font-medium line-clamp-2 mb-1.5 group-hover:text-primary transition-colors',
          isMobile ? 'text-xs leading-tight' : 'text-sm'
        )}>
          {product.title}
        </h3>
        
        {/* Price - Tamanho ajustado para mobile */}
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className={cn(
            'font-bold text-primary',
            isMobile ? 'text-base' : 'text-lg'
          )}>
            {formatPrice(product.price)}
          </span>
          <span className={cn(
            'text-muted-foreground',
            isMobile ? 'text-[10px]' : 'text-xs'
          )}>
            BYX
          </span>
        </div>

        {/* Store Info - Menor no mobile */}
        {product.store && (
          <div className={cn(
            'flex items-center gap-1 text-muted-foreground',
            isMobile ? 'text-[10px]' : 'text-xs'
          )}>
            {product.store.city && (
              <>
                <MapPin className={cn(isMobile ? 'h-2.5 w-2.5' : 'h-3 w-3')} />
                <span className="line-clamp-1">
                  {product.store.city}
                  {product.store.state && ` - ${product.store.state}`}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
