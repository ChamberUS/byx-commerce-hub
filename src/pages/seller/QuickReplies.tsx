import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, Edit, Trash2, GripVertical } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { useMyStore } from '@/hooks/use-store';
import { 
  useQuickReplies, 
  useCreateQuickReply, 
  useUpdateQuickReply, 
  useDeleteQuickReply,
  QuickReply
} from '@/hooks/use-quick-replies';
import { useToast } from '@/hooks/use-toast';

export default function QuickRepliesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: quickReplies, isLoading: loadingReplies } = useQuickReplies(store?.id || '');
  
  const createQuickReply = useCreateQuickReply();
  const updateQuickReply = useUpdateQuickReply();
  const deleteQuickReply = useDeleteQuickReply();

  const [editingReply, setEditingReply] = useState<QuickReply | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteReplyId, setDeleteReplyId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  if (loadingStore || loadingReplies) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    navigate('/app/store/create');
    return null;
  }

  const openCreateDialog = () => {
    setTitle('');
    setContent('');
    setIsCreating(true);
  };

  const openEditDialog = (reply: QuickReply) => {
    setTitle(reply.title);
    setContent(reply.content);
    setEditingReply(reply);
  };

  const closeDialog = () => {
    setIsCreating(false);
    setEditingReply(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos' });
      return;
    }

    try {
      if (editingReply) {
        await updateQuickReply.mutateAsync({
          id: editingReply.id,
          title: title.trim(),
          content: content.trim(),
        });
        toast({ title: 'Resposta atualizada!' });
      } else {
        await createQuickReply.mutateAsync({
          storeId: store.id,
          title: title.trim(),
          content: content.trim(),
        });
        toast({ title: 'Resposta criada!' });
      }
      closeDialog();
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao salvar resposta' });
    }
  };

  const handleDelete = async () => {
    if (!deleteReplyId) return;
    
    try {
      await deleteQuickReply.mutateAsync(deleteReplyId);
      toast({ title: 'Resposta excluída' });
      setDeleteReplyId(null);
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao excluir resposta' });
    }
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/store')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Respostas Rápidas</h1>
              <p className="text-xs text-muted-foreground">{quickReplies?.length || 0} respostas</p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="rounded-xl">
            <Plus className="mr-2 h-4 w-4" />
            Nova
          </Button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {!quickReplies || quickReplies.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Nenhuma resposta rápida</h3>
            <p className="text-muted-foreground mb-4">
              Crie respostas prontas para agilizar suas conversas
            </p>
            <Button onClick={openCreateDialog} className="rounded-xl">
              <Plus className="mr-2 h-4 w-4" />
              Criar Resposta
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {quickReplies.map((reply) => (
              <Card key={reply.id} className="rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 text-muted-foreground">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{reply.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{reply.content}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg"
                        onClick={() => openEditDialog(reply)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-destructive"
                        onClick={() => setDeleteReplyId(reply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreating || !!editingReply} onOpenChange={closeDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingReply ? 'Editar Resposta' : 'Nova Resposta Rápida'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex: Saudação"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="content">Mensagem</Label>
              <Textarea
                id="content"
                placeholder="Ex: Olá! Obrigado pelo interesse..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="rounded-xl">
              {editingReply ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteReplyId} onOpenChange={() => setDeleteReplyId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir resposta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
