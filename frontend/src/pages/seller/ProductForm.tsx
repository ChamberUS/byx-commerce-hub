import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Image as ImageIcon, Plus, X, 
  GripVertical, Package, Trash2 
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyStore } from '@/hooks/use-store';
import { useProduct, useCreateProduct, useUpdateProduct } from '@/hooks/use-products';
import { useSectors, useCategories, useCategoryAttributes, CategoryAttribute } from '@/hooks/use-categories';
import { uploadFile, deleteFile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ProductMedia {
  id?: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File;
}

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: store, isLoading: loadingStore } = useMyStore();
  const { data: existingProduct, isLoading: loadingProduct } = useProduct(isEditing ? id : '');
  const { data: sectors } = useSectors();
  
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  // Form state
  const [listingType, setListingType] = useState<'fixed_price' | 'accepts_offers' | 'auction'>('fixed_price');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('new');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [allowOffers, setAllowOffers] = useState(false);
  const [minOfferPrice, setMinOfferPrice] = useState('');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [status, setStatus] = useState<'draft' | 'active'>('draft');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useCategories(selectedSector || undefined);
  const { data: categoryAttributes } = useCategoryAttributes(selectedCategory);

  // Load existing product data
  useEffect(() => {
    if (isEditing && existingProduct) {
      setListingType(existingProduct.listing_type as any);
      setTitle(existingProduct.title);
      setDescription(existingProduct.description || '');
      setCondition(existingProduct.condition as any);
      setPrice(existingProduct.price.toString());
      setStock((existingProduct.stock_quantity || 1).toString());
      setAllowOffers(existingProduct.allow_offers || false);
      setMinOfferPrice(existingProduct.min_offer_price?.toString() || '');
      setAttributes((existingProduct.attributes as Record<string, string>) || {});
      setStatus(existingProduct.status === 'active' ? 'active' : 'draft');
      
      if (existingProduct.category) {
        setSelectedCategory(existingProduct.category.id);
        // Find sector from category
        const cat = existingProduct.category as any;
        if (cat.sector_id) {
          setSelectedSector(cat.sector_id);
        }
      }
      
      if (existingProduct.product_media) {
        setMedia(existingProduct.product_media.map((m: any) => ({
          id: m.id,
          url: m.url,
          is_primary: m.is_primary,
          sort_order: m.sort_order,
        })));
      }
    }
  }, [isEditing, existingProduct]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newMedia: ProductMedia[] = [];
    for (let i = 0; i < files.length; i++) {
      if (media.length + newMedia.length >= 10) break;
      
      const file = files[i];
      const url = URL.createObjectURL(file);
      newMedia.push({
        url,
        is_primary: media.length === 0 && newMedia.length === 0,
        sort_order: media.length + newMedia.length,
        file,
      });
    }

    setMedia(prev => [...prev, ...newMedia]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setMedia(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Reassign primary if needed
      if (updated.length > 0 && !updated.some(m => m.is_primary)) {
        updated[0].is_primary = true;
      }
      return updated.map((m, i) => ({ ...m, sort_order: i }));
    });
  };

  const setPrimaryImage = (index: number) => {
    setMedia(prev => prev.map((m, i) => ({ ...m, is_primary: i === index })));
  };

  const handleAttributeChange = (slug: string, value: string) => {
    setAttributes(prev => ({ ...prev, [slug]: value }));
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now().toString(36);
  };

  const handleSubmit = async () => {
    if (!store) return;
    
    if (!title.trim()) {
      toast({ variant: 'destructive', title: 'Digite o título do produto' });
      return;
    }
    if (!price || parseFloat(price) <= 0) {
      toast({ variant: 'destructive', title: 'Digite um preço válido' });
      return;
    }
    if (media.length === 0) {
      toast({ variant: 'destructive', title: 'Adicione pelo menos uma imagem' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload new images
      const uploadedMedia: ProductMedia[] = [];
      for (const item of media) {
        if (item.file) {
          const { url, error } = await uploadFile('product-images', store.id, item.file);
          if (error) throw error;
          uploadedMedia.push({
            url: url!,
            is_primary: item.is_primary,
            sort_order: item.sort_order,
          });
        } else {
          uploadedMedia.push(item);
        }
      }

      const productData = {
        title: title.trim(),
        slug: isEditing ? existingProduct?.slug : generateSlug(title),
        description: description.trim() || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 1,
        condition,
        listing_type: listingType,
        allow_offers: allowOffers,
        min_offer_price: allowOffers && minOfferPrice ? parseFloat(minOfferPrice) : null,
        category_id: selectedCategory || null,
        attributes,
        status,
        store_id: store.id,
      };

      let productId = id;

      if (isEditing) {
        await updateProduct.mutateAsync({ id, ...productData });
      } else {
        const result = await createProduct.mutateAsync(productData as any);
        productId = result.id;
      }

      // Handle media - delete old and insert new
      if (productId) {
        // Delete existing media if editing
        if (isEditing) {
          await supabase
            .from('product_media')
            .delete()
            .eq('product_id', productId);
        }

        // Insert new media
        if (uploadedMedia.length > 0) {
          await supabase
            .from('product_media')
            .insert(uploadedMedia.map(m => ({
              product_id: productId,
              url: m.url,
              is_primary: m.is_primary,
              sort_order: m.sort_order,
            })));
        }
      }

      toast({ title: isEditing ? 'Anúncio atualizado!' : 'Anúncio criado!' });
      navigate('/app/store/products');
    } catch (error) {
      console.error('Product error:', error);
      toast({ variant: 'destructive', title: 'Erro ao salvar anúncio' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingStore || (isEditing && loadingProduct)) {
    return (
      <AppLayout>
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    navigate('/app/store/create');
    return null;
  }

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/store/products')}
              className="rounded-xl"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {isEditing ? 'Editar Anúncio' : 'Novo Anúncio'}
            </h1>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Listing Type */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tipo de Anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'fixed_price', label: 'Preço Fixo', desc: 'Venda pelo preço definido' },
                { value: 'accepts_offers', label: 'Aceita Ofertas', desc: 'Negocie com compradores' },
                { value: 'auction', label: 'Leilão', desc: 'Em breve' },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => type.value !== 'auction' && setListingType(type.value as any)}
                  disabled={type.value === 'auction'}
                  className={cn(
                    'p-4 rounded-xl border text-left transition-colors',
                    listingType === type.value ? 'border-primary bg-primary/5' : 'border-border',
                    type.value === 'auction' && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <p className="font-medium text-sm">{type.label}</p>
                  <p className="text-xs text-muted-foreground">{type.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Selection */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Categoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Setor</Label>
              <Select value={selectedSector} onValueChange={(v) => { setSelectedSector(v); setSelectedCategory(''); }}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Selecione o setor" />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((sector) => (
                    <SelectItem key={sector.id} value={sector.id}>
                      {sector.emoji} {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedSector && categories && categories.length > 0 && (
              <div>
                <Label>Categoria</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="Nome do produto"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descreva o produto..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl resize-none"
                rows={4}
              />
            </div>
            <div>
              <Label>Condição</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as any)}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Novo</SelectItem>
                  <SelectItem value="used">Usado</SelectItem>
                  <SelectItem value="refurbished">Recondicionado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço (BYX) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="1"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
            {(listingType === 'accepts_offers' || allowOffers) && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Aceitar ofertas</Label>
                    <p className="text-xs text-muted-foreground">Compradores podem negociar</p>
                  </div>
                  <Switch checked={allowOffers} onCheckedChange={setAllowOffers} />
                </div>
                {allowOffers && (
                  <div>
                    <Label htmlFor="minOffer">Valor mínimo da oferta (BYX)</Label>
                    <Input
                      id="minOffer"
                      type="number"
                      step="0.01"
                      placeholder="Opcional"
                      value={minOfferPrice}
                      onChange={(e) => setMinOfferPrice(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Dynamic Attributes */}
        {categoryAttributes && categoryAttributes.length > 0 && (
          <Card className="rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Características</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categoryAttributes.map((attr) => (
                <DynamicAttributeInput
                  key={attr.id}
                  attribute={attr}
                  value={attributes[attr.slug] || ''}
                  onChange={(v) => handleAttributeChange(attr.slug, v)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Images */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Imagens *</span>
              <span className="text-xs font-normal text-muted-foreground">{media.length}/10</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {media.map((item, index) => (
                <div
                  key={index}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden border-2 group',
                    item.is_primary ? 'border-primary' : 'border-transparent'
                  )}
                >
                  <img src={item.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => setPrimaryImage(index)}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {item.is_primary && (
                    <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  )}
                </div>
              ))}
              {media.length < 10 && (
                <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Clique na imagem para definir como principal. Arraste para reordenar.
            </p>
          </CardContent>
        </Card>

        {/* Status */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status do Anúncio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setStatus('draft')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-colors',
                  status === 'draft' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <p className="font-medium text-sm">Rascunho</p>
                <p className="text-xs text-muted-foreground">Salvar sem publicar</p>
              </button>
              <button
                onClick={() => setStatus('active')}
                className={cn(
                  'p-4 rounded-xl border text-left transition-colors',
                  status === 'active' ? 'border-primary bg-primary/5' : 'border-border'
                )}
              >
                <p className="font-medium text-sm">Publicar</p>
                <p className="text-xs text-muted-foreground">Visível no marketplace</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

function DynamicAttributeInput({
  attribute,
  value,
  onChange,
}: {
  attribute: CategoryAttribute;
  value: string;
  onChange: (value: string) => void;
}) {
  const { name, input_type, options, is_required } = attribute;

  if (input_type === 'select' && options) {
    return (
      <div>
        <Label>{name} {is_required && '*'}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="rounded-xl">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (input_type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <Label>{name} {is_required && '*'}</Label>
        <Switch checked={value === 'true'} onCheckedChange={(v) => onChange(v ? 'true' : 'false')} />
      </div>
    );
  }

  if (input_type === 'number') {
    return (
      <div>
        <Label>{name} {is_required && '*'}</Label>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl"
        />
      </div>
    );
  }

  return (
    <div>
      <Label>{name} {is_required && '*'}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl"
      />
    </div>
  );
}
