import { Link } from 'react-router-dom';
import { useSectors } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

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

  if (isLoading) {
    return (
      <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 min-w-[100px]">
            <Skeleton className="w-[120px] h-[120px] rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!sectors?.length) return null;

  return (
    <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
      {sectors.map((sector) => {
        const img = sector.image_url || fallbackImages[sector.slug] || null;
        return (
          <Link
            key={sector.id}
            to={`/app/search?sector=${sector.slug}`}
            className="flex flex-col items-center gap-2 min-w-[100px] group shrink-0"
          >
            <div className="w-[120px] h-[120px] rounded-full bg-muted overflow-hidden border-2 border-transparent group-hover:border-primary/40 transition-all">
              {img ? (
                <img
                  src={img}
                  alt={sector.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {sector.emoji}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-foreground text-center line-clamp-1 group-hover:text-primary transition-colors">
              {sector.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
