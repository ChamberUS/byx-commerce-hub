import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Store, Upload, Loader2, ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateStore } from '@/hooks/use-store';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { uploadFile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
  'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
  'SP', 'SE', 'TO'
];

const storeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  city: z.string().min(2, 'Cidade é obrigatória'),
  state: z.string().min(2, 'Estado é obrigatório'),
  description: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
});

type StoreFormData = z.infer<typeof storeSchema>;

export default function CreateStore() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const createStore = useCreateStore();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const form = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      slug: '',
      city: '',
      state: '',
      description: '',
      instagram: '',
      whatsapp: '',
      website: '',
    },
  });

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'banner'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'logo') {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const onSubmit = async (data: StoreFormData) => {
    if (!user?.id) return;

    try {
      setUploading(true);

      let logoUrl: string | null = null;
      let bannerUrl: string | null = null;

      // Upload logo
      if (logoFile) {
        const { url, error } = await uploadFile('store-assets', `${user.id}/logo`, logoFile);
        if (error) throw error;
        logoUrl = url;
      }

      // Upload banner
      if (bannerFile) {
        const { url, error } = await uploadFile('store-assets', `${user.id}/banner`, bannerFile);
        if (error) throw error;
        bannerUrl = url;
      }

      // Create store
      const store = await createStore.mutateAsync({
        name: data.name,
        slug: data.slug,
        description: data.description,
      });

      // Update store with additional data
      await supabase
        .from('stores')
        .update({
          city: data.city,
          state: data.state,
          instagram: data.instagram || null,
          whatsapp: data.whatsapp || null,
          website: data.website || null,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        })
        .eq('id', store.id);

      // Add owner as store member
      await supabase
        .from('store_members')
        .insert({
          store_id: store.id,
          user_id: user.id,
          role: 'owner',
        });

      toast({ title: 'Loja criada com sucesso!' });
      navigate('/app/store');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao criar loja',
        description: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Criar Loja</h1>
            <p className="text-xs text-muted-foreground">Configure sua loja no BYX</p>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Banner Upload */}
            <div className="space-y-2">
              <Label>Banner da Loja</Label>
              <div className="relative">
                <div className="h-40 rounded-xl bg-muted overflow-hidden">
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, 'banner')}
                    className="hidden"
                  />
                  <div className="bg-background/90 backdrop-blur p-2 rounded-lg hover:bg-background transition-colors">
                    <Upload className="h-5 w-5" />
                  </div>
                </label>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Logo da Loja</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-muted overflow-hidden flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <Store className="h-10 w-10 text-muted-foreground" />
                    )}
                  </div>
                  <label className="absolute -bottom-1 -right-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'logo')}
                      className="hidden"
                    />
                    <div className="bg-primary p-1.5 rounded-full">
                      <Upload className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </label>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Formatos: JPG, PNG, WebP</p>
                  <p>Tamanho máximo: 2MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Minha Loja Incrível"
                      onChange={(e) => {
                        field.onChange(e);
                        const currentSlug = form.getValues('slug');
                        if (!currentSlug || currentSlug === generateSlug(field.value)) {
                          form.setValue('slug', generateSlug(e.target.value));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Loja *</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-muted-foreground text-sm mr-1">byx.app/store/</span>
                      <Input {...field} placeholder="minha-loja" className="flex-1" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* City & State */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="São Paulo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATES.map(state => (
                          <SelectItem key={state} value={state}>{state}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Conte um pouco sobre sua loja..."
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Social */}
            <div className="space-y-4">
              <h3 className="font-medium">Redes Sociais (opcional)</h3>
              
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <span className="text-muted-foreground text-sm mr-1">@</span>
                        <Input {...field} placeholder="sualoja" className="flex-1" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="11999999999" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://sualoja.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={createStore.isPending || uploading}
            >
              {createStore.isPending || uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando loja...
                </>
              ) : (
                <>
                  <Store className="mr-2 h-5 w-5" />
                  Criar Minha Loja
                </>
              )}
            </Button>
          </form>
        </Form>
      </div>
    </AppLayout>
  );
}
