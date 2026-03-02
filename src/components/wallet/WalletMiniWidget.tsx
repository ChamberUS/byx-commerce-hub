import { Link } from 'react-router-dom';
import { Wallet, ChevronRight } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';
import { cn } from '@/lib/utils';

interface WalletMiniWidgetProps {
  className?: string;
  compact?: boolean;
}

// Mock conversion rate (1 AIOS = R$ 1.00)
const BRL_CONVERSION_RATE = 1.0;

export function WalletMiniWidget({ className, compact = false }: WalletMiniWidgetProps) {
  const { wallet, hasWallet, isWalletActive } = useWallet();

  // Mock balance - in real implementation, this would come from blockchain
  const balance = 0;
  const brlValue = balance * BRL_CONVERSION_RATE;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (!hasWallet) {
    return (
      <Link
        to="/app/wallet/setup"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors',
          className
        )}
      >
        <Wallet className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">Criar Carteira</span>
      </Link>
    );
  }

  if (compact) {
    return (
      <Link
        to="/app/wallet"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl bg-card border hover:border-primary/50 transition-colors',
          className
        )}
      >
        <Wallet className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{formatPrice(balance)}</span>
        <span className="text-xs text-muted-foreground">BYX</span>
      </Link>
    );
  }

  return (
    <Link
      to="/app/wallet"
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors border border-primary/20',
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
        <Wallet className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-muted-foreground">Saldo</p>
        <p className="font-bold text-lg">{formatPrice(balance)} <span className="text-sm font-normal text-muted-foreground">BYX</span></p>
        <p className="text-xs text-muted-foreground">≈ R$ {formatPrice(brlValue)}</p>
      </div>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}
