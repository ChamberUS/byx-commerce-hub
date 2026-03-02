import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield, Lock, HelpCircle, LogOut, ChevronLeft,
  User, CreditCard, Wallet, Store, Bell, Settings,
  FileText, MapPin, MessageSquare, Eye
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/account/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMyStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  icon: React.ElementType;
  label: string;
  description: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  statusIcon?: React.ReactNode;
}

function AccountCard({ icon: Icon, label, description, href, onClick, disabled, statusIcon }: AccountCardProps) {
  const content = (
    <div className={cn(
      'relative p-5 rounded-xl border bg-card hover:border-primary/30 transition-all group',
      disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm',
    )}>
      {statusIcon && (
        <div className="absolute top-3 right-3">{statusIcon}</div>
      )}
      <div className="p-2.5 rounded-xl bg-muted w-fit mb-3">
        <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <h3 className="font-medium text-sm">{label}</h3>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
      {disabled && (
        <Badge variant="outline" className="mt-2 text-[10px]">Em breve</Badge>
      )}
    </div>
  );

  if (href && !disabled) return <Link to={href}>{content}</Link>;
  if (onClick && !disabled) return <div onClick={onClick}>{content}</div>;
  return content;
}

export default function Account() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: myStore } = useMyStore();
  const { toast } = useToast();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const initials = profile?.nome
    ? profile.nome.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const userTypeLabel = profile?.tipo_usuario === 'lojista' ? 'Lojista' : 'Comprador';

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Minha conta</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
        {/* Profile Header - ML style */}
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={profile?.avatar_url || undefined} />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">{profile?.nome || 'Usuário'}</h2>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
          </div>
        </div>

        {/* Main Cards Grid - ML inspired */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <AccountCard
            icon={User}
            label="Informações do perfil"
            description="Dados pessoais e da conta."
            href="/app/account/edit"
            statusIcon={
              <span className="h-3 w-3 rounded-full bg-warning inline-block" title="Incompleto" />
            }
          />
          <AccountCard
            icon={Lock}
            label="Segurança"
            description="PIN, biometria e dispositivos."
            href="/app/account/security"
            statusIcon={
              <span className="h-3 w-3 rounded-full bg-success inline-block" title="Configurado" />
            }
          />
          <AccountCard
            icon={Wallet}
            label="Carteira"
            description="Saldo, transações e criptomoedas."
            href="/app/wallet"
          />
          <AccountCard
            icon={CreditCard}
            label="Cartões"
            description="Cartões salvos na sua conta."
            disabled
          />
          <AccountCard
            icon={MapPin}
            label="Endereços"
            description="Endereços salvos na sua conta."
            disabled
          />
          <AccountCard
            icon={Eye}
            label="Privacidade"
            description="Preferências e controle dos dados."
            href="/app/account/privacy"
          />
          <AccountCard
            icon={Bell}
            label="Comunicações"
            description="Alertas e preferências de notificação."
            href="/app/account/notifications"
          />
          {(profile?.tipo_usuario === 'lojista' || myStore) && (
            <AccountCard
              icon={Store}
              label="Minha Loja"
              description={myStore?.name || 'Gerencie sua loja.'}
              href="/app/store"
            />
          )}
          <AccountCard
            icon={HelpCircle}
            label="Central de Ajuda"
            description="FAQ, tutoriais e suporte."
            href="/app/faq"
          />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Legal */}
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">Legal</h3>
          <div className="rounded-xl border bg-card divide-y">
            <Link to="/legal/terms" className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Termos de Uso</span>
            </Link>
            <Link to="/legal/privacy" className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Política de Privacidade</span>
            </Link>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutDialog(true)}
          className="w-full flex items-center gap-3 p-4 rounded-xl border bg-card text-destructive hover:bg-destructive/5 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sair da conta</span>
        </button>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pb-4">
          Buynnex v1.0.0
        </p>
      </div>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você precisará fazer login novamente para acessar sua conta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
