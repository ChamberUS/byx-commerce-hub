import { Link } from 'react-router-dom';
import { Home, Search, Package, Wallet, User, Store, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMyStore } from '@/hooks/use-store';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();
  const { profile } = useAuth();
  const { data: myStore } = useMyStore();

  const isLojista = profile?.tipo_usuario === 'lojista' || myStore;

  const navItems = [
    { path: '/app', icon: Home, label: 'Início' },
    { path: '/app/search', icon: Search, label: 'Buscar' },
    { path: '/app/orders', icon: Package, label: 'Pedidos' },
    { path: '/app/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/app/account', icon: User, label: 'Conta' },
  ];

  // Replace Chat with Store for lojistas
  if (isLojista) {
    navItems[3] = { path: '/app/store', icon: Store, label: 'Loja' };
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/app'
              ? location.pathname === '/app'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded-xl',
                'transition-colors min-w-[56px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-all',
                  isActive && 'scale-110'
                )}
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
}
