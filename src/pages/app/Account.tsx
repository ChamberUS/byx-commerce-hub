import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  CreditCard,
  Settings,
  FileText,
  Wallet,
  Store,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileCard } from '@/components/account/ProfileCard';
import { BeginnerModeToggle } from '@/components/account/BeginnerModeToggle';
import { ThemeToggle } from '@/components/account/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useMyStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-1">
        {title}
      </h3>
      <div className="rounded-2xl bg-card border divide-y">
        {children}
      </div>
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  badge?: string;
  variant?: 'default' | 'destructive';
}

function SettingsRow({ 
  icon: Icon, 
  label, 
  description, 
  href, 
  onClick, 
  disabled = false,
  badge,
  variant = 'default',
}: SettingsRowProps) {
  const content = (
    <div 
      className={cn(
        'flex items-center gap-3 p-4 transition-colors',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted/50',
        variant === 'destructive' && 'text-destructive'
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className={cn(
        'p-2 rounded-xl',
        variant === 'destructive' ? 'bg-destructive/10' : 'bg-muted'
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium">{label}</span>
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {!disabled && variant !== 'destructive' && (
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      )}
    </div>
  );

  if (href && !disabled) {
    return <Link to={href}>{content}</Link>;
  }

  return content;
}

export default function Account() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuth();
  const { data: myStore } = useMyStore();
  const { toast } = useToast();

  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [updatingMode, setUpdatingMode] = useState(false);

  const handleModeChange = async (checked: boolean) => {
    setUpdatingMode(true);
    try {
      const { error } = await updateProfile({ modo_iniciante: checked });
      if (error) throw error;
      toast({
        title: checked ? 'Modo iniciante ativado' : 'Modo avançado ativado',
      });
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erro ao alterar modo',
      });
    } finally {
      setUpdatingMode(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  const userTypeLabel = profile?.tipo_usuario === 'lojista' ? 'Lojista' : 'Comprador';

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Minha Conta</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6 max-w-2xl mx-auto">
        {/* Profile Card with Badge */}
        <div 
          className="rounded-2xl bg-card border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/app/account/edit')}
        >
          <div className="p-4">
            <div className="flex items-start gap-4">
              <ProfileCard
                nome={profile?.nome}
                email={profile?.email}
                avatarUrl={profile?.avatar_url}
                tipoUsuario={profile?.tipo_usuario || 'cliente'}
              />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="secondary">{userTypeLabel}</Badge>
              {myStore?.is_verified && (
                <Badge variant="default" className="bg-success text-success-foreground">
                  Verificado
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Beginner Mode */}
        <BeginnerModeToggle
          checked={profile?.modo_iniciante ?? true}
          onCheckedChange={handleModeChange}
          disabled={updatingMode}
        />

        {/* Theme / Dark Mode */}
        <ThemeToggle />

        {/* Account Data */}
        <SettingsSection title="Dados da conta">
          <SettingsRow
            icon={User}
            label="Dados pessoais"
            description="Nome, email, telefone"
            href="/app/account/edit"
          />
          <SettingsRow
            icon={Lock}
            label="Segurança"
            description="PIN, biometria, dispositivos"
            href="/app/account/security"
          />
          <SettingsRow
            icon={CreditCard}
            label="Pagamentos"
            description="Métodos de pagamento"
            disabled
            badge="Em breve"
          />
        </SettingsSection>

        {/* Financial */}
        <SettingsSection title="Financeiro">
          <SettingsRow
            icon={Wallet}
            label="Carteira"
            description="Saldo e transações"
            href="/app/wallet"
          />
          {(profile?.tipo_usuario === 'lojista' || myStore) && (
            <SettingsRow
              icon={Store}
              label="Minha Loja"
              description={myStore?.name || 'Gerencie sua loja'}
              href="/app/store"
            />
          )}
        </SettingsSection>

        {/* Preferences */}
        <SettingsSection title="Preferências">
          <SettingsRow
            icon={Bell}
            label="Notificações"
            description="Alertas e preferências"
            href="/app/account/notifications"
          />
          <SettingsRow
            icon={Settings}
            label="Configurações"
            description="Idioma, tema, acessibilidade"
            disabled
            badge="Em breve"
          />
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacidade e Legal">
          <SettingsRow
            icon={Shield}
            label="Privacidade & Dados"
            description="Seus dados e permissões"
            href="/app/account/privacy"
          />
          <SettingsRow
            icon={FileText}
            label="Termos de Uso"
            description="Termos e condições"
            href="/legal/terms"
          />
          <SettingsRow
            icon={FileText}
            label="Política de Privacidade"
            description="Como tratamos seus dados"
            href="/legal/privacy"
          />
        </SettingsSection>

        {/* Help */}
        <SettingsSection title="Ajuda">
          <SettingsRow
            icon={HelpCircle}
            label="Central de Ajuda"
            description="FAQ e tutoriais"
            href="/app/faq"
          />
        </SettingsSection>

        {/* Logout */}
        <div className="rounded-2xl bg-card border">
          <SettingsRow
            icon={LogOut}
            label="Sair da conta"
            variant="destructive"
            onClick={() => setShowLogoutDialog(true)}
          />
        </div>

        {/* Version */}
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
