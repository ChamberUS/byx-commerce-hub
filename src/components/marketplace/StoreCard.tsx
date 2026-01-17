import { Link } from 'react-router-dom';
import { Star, MapPin, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Store } from '@/hooks/use-store';

interface StoreCardProps {
  store: Store;
  className?: string;
  showFavorite?: boolean;
  onFavorite?: () => void;
  isFavorite?: boolean;
}

export function StoreCard({ store, className, showFavorite, onFavorite, isFavorite }: StoreCardProps) {
  const initials = store.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Link 
      to={`/app/store/${store.slug}`}
      className={cn(
        'group block bg-card rounded-2xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30',
        className
      )}
    >
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-br from-primary/20 to-primary/5">
        {store.banner_url && (
          <img
            src={store.banner_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        
        {showFavorite && (
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              'absolute top-2 right-2 h-8 w-8 rounded-full shadow-md',
              isFavorite && 'bg-destructive/10 text-destructive hover:bg-destructive/20'
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onFavorite?.();
            }}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-0 -mt-6 relative">
        <Avatar className="h-12 w-12 border-4 border-card mb-2">
          <AvatarImage src={store.logo_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">
          {store.name}
        </h3>

        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
          {store.rating_count > 0 && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-warning text-warning" />
              <span>{store.rating_avg.toFixed(1)}</span>
              <span>({store.rating_count})</span>
            </div>
          )}
          
          {store.city && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{store.city}</span>
            </div>
          )}
        </div>

        {store.is_verified && (
          <Badge variant="secondary" className="text-xs">
            Verificada
          </Badge>
        )}
      </div>
    </Link>
  );
}
