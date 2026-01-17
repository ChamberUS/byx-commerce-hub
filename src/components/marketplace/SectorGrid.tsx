import { Link } from 'react-router-dom';
import { useSectors } from '@/hooks/use-categories';
import { Skeleton } from '@/components/ui/skeleton';

export function SectorGrid() {
  const { data: sectors, isLoading } = useSectors();

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!sectors?.length) {
    return null;
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {sectors.map((sector) => (
        <Link
          key={sector.id}
          to={`/app/search?sector=${sector.slug}`}
          className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border hover:border-primary/50 hover:bg-accent/50 transition-colors"
        >
          <span className="text-2xl">{sector.emoji}</span>
          <span className="text-xs font-medium text-muted-foreground text-center line-clamp-1">
            {sector.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
