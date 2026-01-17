import { Link } from 'react-router-dom';
import { Heart, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToggleFavoriteProduct, useIsProductFavorite } from '@/hooks/use-favorites';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/hooks/use-products';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { user } = useAuth();
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
        'group block bg-card rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30',
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-square bg-muted">
        <img
          src={primaryImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Favorite Button */}
        {user && (
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full shadow-md',
              isFavorite && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            )}
            onClick={handleFavoriteClick}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>
        )}

        {/* Condition Badge */}
        <Badge
          variant="secondary"
          className="absolute bottom-2 left-2 text-xs"
        >
          {conditionLabels[product.condition]}
        </Badge>

        {/* Offers Badge */}
        {product.allow_offers && (
          <Badge
            className="absolute bottom-2 right-2 text-xs bg-success text-success-foreground"
          >
            Aceita oferta
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          <span className="text-xs text-muted-foreground">BYX</span>
        </div>

        {/* Store Info */}
        {product.store && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {product.store.city && (
              <>
                <MapPin className="h-3 w-3" />
                <span>{product.store.city}</span>
                {product.store.state && <span>- {product.store.state}</span>}
              </>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
