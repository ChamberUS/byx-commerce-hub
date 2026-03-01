import { User, Store, ShoppingBag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  nome?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
  tipoUsuario: 'cliente' | 'lojista';
}

export function ProfileCard({ nome, email, avatarUrl, tipoUsuario }: ProfileCardProps) {
  const initials = nome
    ? nome
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <div className="flex items-center gap-4 p-4">
      <Avatar className="h-16 w-16 border-2 border-primary/20">
        <AvatarImage src={avatarUrl || undefined} alt={nome || 'Usuário'} />
        <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <h2 className="font-semibold text-lg text-foreground truncate">
          {nome || 'Usuário'}
        </h2>
        <p className="text-sm text-muted-foreground truncate">{email}</p>
        <Badge
          variant="secondary"
          className="mt-1.5 gap-1 text-xs font-medium"
        >
          {tipoUsuario === 'lojista' ? (
            <>
              <Store className="h-3 w-3" />
              Lojista
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3" />
              Cliente
            </>
          )}
        </Badge>
      </div>
    </div>
  );
}