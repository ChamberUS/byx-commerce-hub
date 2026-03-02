import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  Camera, 
  User, 
  Store, 
  Check,
  Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function EditProfile() {
  const navigate = useNavigate();
  const { profile, updateProfile, user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(profile?.nome || '');
  const [tipoUsuario, setTipoUsuario] = useState<'cliente' | 'lojista'>(
    profile?.tipo_usuario || 'cliente'
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Arquivo inválido',
        description: 'Selecione uma imagem.',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: 'destructive',
        title: 'Arquivo muito grande',
        description: 'O tamanho máximo é 5MB.',
      });
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      setAvatarUrl(urlData.publicUrl + '?t=' + Date.now());
      
      toast({ title: 'Foto atualizada!' });
    } catch (err) {
      console.error('Upload error:', err);
      toast({
        variant: 'destructive',
        title: 'Erro ao enviar foto',
        description: 'Tente novamente.',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = nome.trim();
    if (!trimmedName) {
      toast({ variant: 'destructive', title: 'Nome obrigatório' });
      return;
    }
    if (trimmedName.length > 100) {
      toast({ variant: 'destructive', title: 'Nome muito longo', description: 'Máximo 100 caracteres.' });
      return;
    }
    if (!/^[\p{L}\s'-]+$/u.test(trimmedName)) {
      toast({ variant: 'destructive', title: 'Nome inválido', description: 'Use apenas letras, espaços, hifens e apóstrofos.' });
      return;
    }

    setSaving(true);

    try {
      const { error } = await updateProfile({
        nome: nome.trim(),
        tipo_usuario: tipoUsuario,
        avatar_url: avatarUrl || null,
      });

      if (error) throw error;

      toast({ title: 'Perfil atualizado!' });
      navigate(-1);
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: 'Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    if (!nome) return 'U';
    return nome.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-xl"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Editar Perfil</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl text-primary"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Check className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Avatar */}
        <div className="flex flex-col items-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAvatarClick}
            disabled={uploading}
            className="relative group"
          >
            <Avatar className="w-24 h-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </motion.button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAvatarClick}
            disabled={uploading}
            className="mt-2 text-primary"
          >
            {uploading ? 'Enviando...' : 'Alterar foto'}
          </Button>
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="nome">Nome completo</Label>
          <Input
            id="nome"
            value={nome}
            onChange={(e) => setNome(e.target.value.slice(0, 100))}
            maxLength={100}
            placeholder="Seu nome"
            className="rounded-xl h-12"
          />
        </div>

        {/* User Type */}
        <div className="space-y-3">
          <Label>Tipo de conta</Label>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTipoUsuario('cliente')}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors
                ${tipoUsuario === 'cliente' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/50'}
              `}
            >
              <div className={`p-3 rounded-xl ${tipoUsuario === 'cliente' ? 'bg-primary/10' : 'bg-muted'}`}>
                <User className={`w-6 h-6 ${tipoUsuario === 'cliente' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`font-medium ${tipoUsuario === 'cliente' ? 'text-primary' : 'text-foreground'}`}>
                Cliente
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Quero comprar
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setTipoUsuario('lojista')}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-colors
                ${tipoUsuario === 'lojista' 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border bg-card hover:border-primary/50'}
              `}
            >
              <div className={`p-3 rounded-xl ${tipoUsuario === 'lojista' ? 'bg-primary/10' : 'bg-muted'}`}>
                <Store className={`w-6 h-6 ${tipoUsuario === 'lojista' ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <span className={`font-medium ${tipoUsuario === 'lojista' ? 'text-primary' : 'text-foreground'}`}>
                Lojista
              </span>
              <span className="text-xs text-muted-foreground text-center">
                Quero vender
              </span>
            </motion.button>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving || !nome.trim()}
          className="w-full h-12 rounded-xl"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </div>
    </AppLayout>
  );
}
