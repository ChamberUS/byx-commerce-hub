import { Link } from 'react-router-dom';
import { Coins, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function CryptoUSPBanner() {
  const isMobile = useIsMobile();

  return (
    <Link 
      to="/app/wallet"
      className={cn(
        'block rounded-2xl overflow-hidden border group cursor-pointer',
        // Glassmorphism effect
        'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent',
        'border-primary/20 backdrop-blur-xl',
        // Hover animations (desktop) - respecting motion preferences
        'transition-all duration-300',
        'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30',
        'motion-safe:hover:scale-[1.01]',
        // Mobile touch effect
        'active:scale-[0.99]'
      )}
    >
      <div className={cn(
        'p-4 md:p-6',
        'flex items-center gap-3 md:gap-4',
        // Subtle shimmer effect
        'relative overflow-hidden'
      )}>
        {/* Shimmer overlay (only on hover, respecting motion) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 motion-reduce:hidden">
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent motion-safe:animate-shimmer" />
        </div>

        {/* Icon */}
        <div className={cn(
          'rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0',
          'transition-transform duration-300 motion-safe:group-hover:rotate-12 motion-safe:group-hover:scale-110',
          isMobile ? 'w-10 h-10' : 'w-12 h-12'
        )}>
          <Coins className={cn(
            'text-primary',
            isMobile ? 'h-5 w-5' : 'h-6 w-6'
          )} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-semibold mb-0.5 md:mb-1',
            isMobile ? 'text-sm' : 'text-base'
          )}>
            Pagamentos com AIOS/BYX
          </h3>
          <p className={cn(
            'text-muted-foreground line-clamp-2 md:line-clamp-1',
            isMobile ? 'text-xs' : 'text-sm'
          )}>
            Compre e venda usando tokens AIOS — rápido, seguro e sem taxas abusivas.
          </p>
        </div>

        {/* CTA */}
        <div className={cn(
          'flex items-center gap-1 text-primary font-medium whitespace-nowrap flex-shrink-0',
          'transition-transform motion-safe:group-hover:translate-x-1',
          isMobile ? 'text-xs' : 'text-sm'
        )}>
          <span className="hidden md:inline">Como funciona</span>
          <ArrowRight className={cn(isMobile ? 'h-4 w-4' : 'h-5 w-5')} />
        </div>
      </div>
    </Link>
  );
}
