import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Trash2,
  Shield,
  Database,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
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
import { useToast } from '@/hooks/use-toast';

const dataWeStore = [
  { label: 'Informações de perfil', description: 'Nome, email, telefone' },
  { label: 'Preferências', description: 'Modo iniciante, notificações' },
  { label: 'Histórico de pedidos', description: 'Compras e vendas realizadas' },
  { label: 'Endereços de entrega', description: 'Locais cadastrados' },
];

export default function Privacy() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadData = async () => {
    setDownloading(true);
    // Placeholder
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setDownloading(false);
    toast({
      title: 'Solicitação recebida',
      description: 'Você receberá um email com seus dados em breve.',
    });
  };

  const handleDeleteAccount = () => {
    toast({
      title: 'Solicitação recebida',
      description: 'Entre em contato com o suporte para finalizar a exclusão.',
    });
    setShowDeleteDialog(false);
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
          <h1 className="text-lg font-semibold">Privacidade & Dados</h1>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-4 space-y-6">
        {/* LGPD Badge */}
        <div className="p-4 rounded-2xl bg-success/10 border border-success/20">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-success" />
            <div>
              <h3 className="font-medium text-foreground">
                Proteção de dados LGPD
              </h3>
              <p className="text-sm text-muted-foreground">
                Seus dados são protegidos conforme a lei brasileira.
              </p>
            </div>
          </div>
        </div>

        {/* Data we store */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Database className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Dados que guardamos</h2>
          </div>
          <div className="rounded-2xl bg-card border divide-y">
            {dataWeStore.map((item, index) => (
              <div key={index} className="p-4">
                <p className="font-medium text-foreground">{item.label}</p>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Actions */}
        <section className="space-y-3">
          <Button
            variant="outline"
            onClick={handleDownloadData}
            disabled={downloading}
            className="w-full h-12 rounded-xl justify-start gap-3"
          >
            {downloading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            {downloading ? 'Processando...' : 'Baixar meus dados'}
          </Button>

          <Button
            variant="outline"
            onClick={() => setShowDeleteDialog(true)}
            className="w-full h-12 rounded-xl justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
          >
            <Trash2 className="h-5 w-5" />
            Excluir minha conta
          </Button>
        </section>

        <p className="text-xs text-muted-foreground text-center">
          Dados de transações em blockchain não podem ser excluídos, mas não contêm informações pessoais identificáveis.
        </p>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <AlertDialogTitle>Excluir conta?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados serão excluídos permanentemente, exceto registros de transações em blockchain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}