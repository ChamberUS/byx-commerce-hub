import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, ShoppingCart, MessageCircle, 
  Zap, Settings, RotateCcw, ClipboardCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/app/store', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/store/post-sale', icon: ClipboardCheck, label: 'Pós-Venda' },
  { path: '/app/store/products', icon: Package, label: 'Anúncios' },
  { path: '/app/store/orders', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/app/chat', icon: MessageCircle, label: 'Mensagens' },
  { path: '/app/store/quick-replies', icon: Zap, label: 'Respostas' },
  { path: '/app/store/edit', icon: Settings, label: 'Config' },
];

export function SellerNav() {
  const location = useLocation();

  return (
    <nav className="hidden md:flex items-center gap-1 p-1 bg-muted/50 rounded-xl">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path || 
          (item.path !== '/app/store' && location.pathname.startsWith(item.path));

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isActive 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
