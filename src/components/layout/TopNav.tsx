import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, Bell, MessageCircle, Heart, Package, Wallet, 
  Home, User, Store, Menu, X, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { path: '/app', icon: Home, label: 'Início' },
  { path: '/app/search', icon: Search, label: 'Buscar' },
  { path: '/app/favorites', icon: Heart, label: 'Favoritos' },
  { path: '/app/orders', icon: Package, label: 'Pedidos' },
  { path: '/app/wallet', icon: Wallet, label: 'Carteira' },
];

export function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const { data: myStore } = useMyStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initials = profile?.nome
    ? profile.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => {
    if (path === '/app') return location.pathname === '/app';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-50 border-b">
      <div className="max-w-7xl mx-auto">
        {/* Main Nav Row */}
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          {/* Logo */}
          <Link to="/app" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
            <span className="font-bold text-xl hidden sm:block">BYX</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar produtos, lojas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
              />
            </div>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Chat */}
            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
              <Link to="/app/chat">
                <MessageCircle className="h-5 w-5" />
              </Link>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-xl relative" asChild>
              <Link to="/app/notifications">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-xl gap-2 px-2">
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="font-medium">{profile?.nome || 'Usuário'}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/app/account">
                    <User className="mr-2 h-4 w-4" />
                    Minha Conta
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/favorites">
                    <Heart className="mr-2 h-4 w-4" />
                    Favoritos
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/app/orders">
                    <Package className="mr-2 h-4 w-4" />
                    Meus Pedidos
                  </Link>
                </DropdownMenuItem>
                {myStore ? (
                  <DropdownMenuItem asChild>
                    <Link to="/app/seller">
                      <Store className="mr-2 h-4 w-4" />
                      Minha Loja
                    </Link>
                  </DropdownMenuItem>
                ) : profile?.tipo_usuario === 'lojista' && (
                  <DropdownMenuItem asChild>
                    <Link to="/app/seller/create">
                      <Store className="mr-2 h-4 w-4" />
                      Criar Loja
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation Links - Desktop */}
        <nav className="hidden md:flex items-center gap-1 px-4 pb-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  active 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
          {myStore && (
            <Link
              to="/app/seller"
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive('/app/seller')
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Store className="h-4 w-4" />
              Minha Loja
            </Link>
          )}
        </nav>

        {/* Mobile Search */}
        <form onSubmit={handleSearch} className="px-4 pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos, lojas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl bg-muted/50 border-0"
            />
          </div>
        </form>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background px-4 py-2">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  active 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
          {myStore && (
            <Link
              to="/app/seller"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive('/app/seller')
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Store className="h-5 w-5" />
              Minha Loja
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
