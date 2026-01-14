import { Search, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { id: 1, name: 'Eletrônicos', emoji: '📱' },
  { id: 2, name: 'Moda', emoji: '👕' },
  { id: 3, name: 'Casa', emoji: '🏠' },
  { id: 4, name: 'Esportes', emoji: '⚽' },
  { id: 5, name: 'Beleza', emoji: '💄' },
  { id: 6, name: 'Games', emoji: '🎮' },
  { id: 7, name: 'Livros', emoji: '📚' },
  { id: 8, name: 'Mais', emoji: '➕' },
];

export default function Home() {
  const { profile } = useAuth();

  const initials = profile?.nome
    ? profile.nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">B</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Olá,</p>
              <p className="font-semibold text-sm">
                {profile?.nome?.split(' ')[0] || 'Usuário'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            </Button>
            <Link to="/app/account">
              <Avatar className="h-9 w-9 border-2 border-primary/20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar produtos, lojas..."
              className="pl-10 h-11 rounded-xl bg-muted/50 border-0"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-8">
        {/* Categories */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Categorias</h2>
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-card border hover:border-primary/50 hover:bg-accent/50 transition-colors"
              >
                <span className="text-2xl">{category.emoji}</span>
                <span className="text-xs font-medium text-muted-foreground">
                  {category.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Featured */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Destaques</h2>
            <Button variant="link" size="sm" className="text-primary">
              Ver todos
            </Button>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 p-6 text-center">
            <p className="text-muted-foreground">
              Em breve: produtos em destaque
            </p>
          </div>
        </section>

        {/* Recent */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recentes</h2>
            <Button variant="link" size="sm" className="text-primary">
              Ver todos
            </Button>
          </div>
          <div className="rounded-2xl bg-muted/50 p-6 text-center">
            <p className="text-muted-foreground">
              Você ainda não visualizou nenhum produto.
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}