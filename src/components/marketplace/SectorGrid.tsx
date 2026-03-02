import { Link } from 'react-router-dom';
import { useSectors } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { getCategoryGrid } from '@/lib/responsive-constants';

// Static fallback images by slug
import electronicsImg from '@/assets/categories/electronics.jpg';
import fashionImg from '@/assets/categories/fashion.jpg';
import homeImg from '@/assets/categories/home.jpg';
import sportsImg from '@/assets/categories/sports.jpg';
import beautyImg from '@/assets/categories/beauty.jpg';
import gamesImg from '@/assets/categories/games.jpg';
import booksImg from '@/assets/categories/books.jpg';
import vehiclesImg from '@/assets/categories/vehicles.jpg';

const fallbackImages: Record<string, string> = {
  eletronicos: electronicsImg,
  moda: fashionImg,
  casa: homeImg,
  esportes: sportsImg,
  beleza: beautyImg,
  games: gamesImg,
  livros: booksImg,
  veiculos: vehiclesImg,
};

export function SectorGrid() {
  const { data: sectors, isLoading } = useSectors();
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className={cn(
        getCategoryGrid(),
        'animate-pulse'
      )}>
        {Array.from({ length: isMobile ? 4 : 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className={cn(
              'rounded-full',
              isMobile ? 'w-16 h-16' : 'w-20 h-20 md:w-24 md:h-24'
            )} />
            <Skeleton className={cn(
              'h-3',
              isMobile ? 'w-12' : 'w-16'
            )} />
          </div>
        ))}
      </div>
    );
  }

  if (!sectors?.length) return null;

  return (
    <div className={getCategoryGrid()}>
      {sectors.map((sector) => {
        const img = sector.image_url || fallbackImages[sector.slug] || null;
        return (
          <Link
            key={sector.id}
            to={`/app/search?sector=${sector.slug}`}
            className="flex flex-col items-center gap-2 group"
          >
            {/* Icon/Image - Touch-friendly no mobile */}
            <div className={cn(
              'rounded-full bg-muted overflow-hidden border-2 border-transparent',
              'group-hover:border-primary/40 transition-all',
              'group-active:scale-95',
              isMobile ? 'w-16 h-16' : 'w-20 h-20 md:w-24 md:h-24'
            )}>
              {img ? (
                <img
                  src={img}
                  alt={sector.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className={cn(
                  'w-full h-full flex items-center justify-center',
                  isMobile ? 'text-2xl' : 'text-2xl md:text-3xl'
                )}>
                  {sector.emoji}
                </div>
              )}
            </div>
            
            {/* Label */}
            <span className={cn(
              'font-medium text-foreground text-center line-clamp-1',
              'group-hover:text-primary transition-colors',
              isMobile ? 'text-xs' : 'text-xs md:text-sm'
            )}>
              {sector.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
