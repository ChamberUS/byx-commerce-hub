import { Link } from 'react-router-dom';
import { Coins, ArrowRight } from 'lucide-react';

export function CryptoUSPBanner() {
  return (
    <section className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-primary/20">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <Coins className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Pagamentos com AIOS/BYX</h3>
          <p className="text-sm text-muted-foreground">
            Compre e venda usando tokens AIOS — rápido, seguro e sem taxas abusivas.
          </p>
        </div>
        <Link 
          to="/app/wallet" 
          className="flex items-center gap-1 text-primary text-sm font-medium hover:underline whitespace-nowrap"
        >
          Como funciona
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
