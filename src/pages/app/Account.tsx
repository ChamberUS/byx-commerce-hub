import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  Lock,
  HelpCircle,
  LogOut,
  ChevronLeft,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileCard } from '@/components/account/ProfileCard';
import { BeginnerModeToggle } from '@/components/account/BeginnerModeToggle';
import { SettingsItem } from '@/components/account/SettingsItem';
import { Button } from '@/components/ui/button';
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

export default function Account() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut } = useAuth();
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
    } catch (err) {
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
      <div className="px-4 py-4 space-y-6">
        {/* Profile Card */}
        <div 
          className="rounded-2xl bg-card border cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => navigate('/app/account/edit')}
        >
          <ProfileCard
            nome={profile?.nome}
            email={profile?.email}
            avatarUrl={profile?.avatar_url}
            tipoUsuario={profile?.tipo_usuario || 'cliente'}
          />
        </div>

        {/* Beginner Mode */}
        <BeginnerModeToggle
          checked={profile?.modo_iniciante ?? true}
          onCheckedChange={handleModeChange}
          disabled={updatingMode}
        />

        {/* Settings List */}
        <div className="rounded-2xl bg-card border divide-y">
          <SettingsItem
            icon={Lock}
            label="Segurança"
            description="PIN, biometria, dispositivos"
            onClick={() => navigate('/app/account/security')}
          />
          <SettingsItem
            icon={Bell}
            label="Notificações"
            description="Alertas e preferências"
            onClick={() => navigate('/app/account/notifications')}
          />
          <SettingsItem
            icon={Shield}
            label="Privacidade & Dados"
            description="Seus dados e permissões"
            onClick={() => navigate('/app/account/privacy')}
          />
          <SettingsItem
            icon={HelpCircle}
            label="Ajuda e Suporte"
            description="FAQ, tutoriais, contato"
            onClick={() => {}}
          />
        </div>

        {/* Logout */}
        <div className="rounded-2xl bg-card border">
          <SettingsItem
            icon={LogOut}
            label="Sair da conta"
            variant="destructive"
            onClick={() => setShowLogoutDialog(true)}
          />
        </div>

        {/* Version */}
        <p className="text-xs text-center text-muted-foreground">
          BYX v1.0.0 • Fase 1
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