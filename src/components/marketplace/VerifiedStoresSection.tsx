import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import type { Store } from '@/hooks/use-store';

export function VerifiedStoresSection() {
  const { data: stores, isLoading } = useQuery({
    queryKey: ['verified-stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating_avg', { ascending: false })
        .limit(6);
      
      if (error) throw error;
      return data as Store[];
    },
  });

  if (isLoading) {
    return (
      <section>
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="w-32 h-40 rounded-2xl flex-shrink-0" />
          ))}
        </div>
      </section>
    );
  }

  if (!stores?.length) {
    return null;
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Lojas Verificadas</h2>
        </div>
        <Button variant="link" size="sm" className="text-primary" asChild>
          <Link to="/app/search?verified=true">Ver todas</Link>
        </Button>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            to={`/app/store/${store.slug}`}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border hover:border-primary/50 transition-colors flex-shrink-0 w-32"
          >
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={store.logo_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                {store.name[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-center line-clamp-1">
              {store.name}
            </span>
            <Badge variant="secondary" className="text-xs gap-1">
              <BadgeCheck className="h-3 w-3" />
              Verificada
            </Badge>
          </Link>
        ))}
      </div>
    </section>
  );
}
