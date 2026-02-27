import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, Image as ImageIcon,
  Plus, Trash2, Package, Eye, Loader2,
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMyStore } from '@/hooks/use-store';
import { useCreateProduct } from '@/hooks/use-products';
import { useSectors, useCategories, useCategoryAttributes, type CategoryAttribute } from '@/hooks/use-categories';
import { uploadFile } from '@/lib/storage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MediaItem {
  url: string;
  is_primary: boolean;
  sort_order: number;
  file?: File;
}

const STEPS = [
  { id: 'category', label: 'Categoria' },
  { id: 'details', label: 'Detalhes' },
  { id: 'media', label: 'Fotos' },
  { id: 'pricing', label: 'Preço' },
  { id: 'review', label: 'Revisão' },
];

export default function CreateListingWizard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: store, isLoading: loadingStore } = useMyStore();
  const createProduct = useCreateProduct();

  const [step, setStep] = useState(0);

  // Step 1: Category
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [listingType, setListingType] = useState<'fixed_price' | 'accepts_offers'>('fixed_price');

  // Step 2: Details
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<'new' | 'used' | 'refurbished'>('new');
  const [attributes, setAttributes] = useState<Record<string, string>>({});

  // Step 3: Media
  const [media, setMedia] = useState<MediaItem[]>([]);

  // Step 4: Pricing
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [allowOffers, setAllowOffers] = useState(false);
  const [minOfferPrice, setMinOfferPrice] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: sectors } = useSectors();
  const { data: categories } = useCategories(selectedSector || undefined);
  const { data: categoryAttributes } = useCategoryAttributes(selectedCategory);

  useEffect(() => {
    if (listingType === 'accepts_offers') setAllowOffers(true);
  }, [listingType]);

  if (loadingStore) {
    return (
      <AppLayout>
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!store) {
    navigate('/app/store/create');
    return null;
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  const canNext = (): boolean => {
    switch (step) {
      case 0: return !!selectedSector;
      case 1: return !!title.trim();
      case 2: return media.length > 0;
      case 3: return !!price && parseFloat(price) > 0;
      case 4: return true;
      default: return false;
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newMedia: MediaItem[] = [];
    for (let i = 0; i < files.length; i++) {
      if (media.length + newMedia.length >= 10) break;
      const file = files[i];
      newMedia.push({
        url: URL.createObjectURL(file),
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
      if (updated.length > 0 && !updated.some(m => m.is_primary)) updated[0].is_primary = true;
      return updated.map((m, i) => ({ ...m, sort_order: i }));
    });
  };

  const setPrimaryImage = (index: number) => {
    setMedia(prev => prev.map((m, i) => ({ ...m, is_primary: i === index })));
  };

  const generateSlug = (text: string) =>
    text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const uploadedMedia: MediaItem[] = [];
      for (const item of media) {
        if (item.file) {
          const { url, error } = await uploadFile('product-images', store.id, item.file);
          if (error) throw error;
          uploadedMedia.push({ url: url!, is_primary: item.is_primary, sort_order: item.sort_order });
        } else {
          uploadedMedia.push(item);
        }
      }

      const result = await createProduct.mutateAsync({
        title: title.trim(),
        slug: generateSlug(title),
        description: description.trim() || null,
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 1,
        condition,
        listing_type: listingType,
        allow_offers: allowOffers,
        min_offer_price: allowOffers && minOfferPrice ? parseFloat(minOfferPrice) : null,
        category_id: selectedCategory || null,
        attributes,
        status: 'active',
        store_id: store.id,
        published_at: new Date().toISOString(),
      } as any);

      if (uploadedMedia.length > 0) {
        await supabase.from('product_media').insert(
          uploadedMedia.map(m => ({
            product_id: result.id,
            url: m.url,
            is_primary: m.is_primary,
            sort_order: m.sort_order,
          }))
        );
      }

      toast({ title: 'Anúncio publicado com sucesso!' });
      navigate('/app/store/products');
    } catch (error: any) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Erro ao publicar', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: string) => {
    const n = parseFloat(val);
    return isNaN(n) ? '0,00' : n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  const selectedCategoryName = categories?.find(c => c.id === selectedCategory)?.name;
  const selectedSectorObj = sectors?.find(s => s.id === selectedSector);

  const conditionLabels: Record<string, string> = { new: 'Novo', used: 'Usado', refurbished: 'Recondicionado' };

  return (
    <AppLayout>
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => step > 0 ? setStep(step - 1) : navigate('/app/store/products')} className="rounded-xl">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">Novo Anúncio</h1>
                <p className="text-xs text-muted-foreground">Etapa {step + 1} de {STEPS.length}: {STEPS[step].label}</p>
              </div>
            </div>
            {step === STEPS.length - 1 && (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Publicando...' : 'Publicar'}
              </Button>
            )}
          </div>
          {/* Stepper */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.id} className={cn('flex-1 h-1.5 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-muted')} />
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Main Form Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* STEP 0: Category */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Tipo de anúncio</Label>
                      <p className="text-sm text-muted-foreground mb-3">Como você quer vender?</p>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 'fixed_price' as const, label: 'Preço Fixo', desc: 'Venda pelo preço definido' },
                          { value: 'accepts_offers' as const, label: 'Aceita Ofertas', desc: 'Negocie com compradores' },
                        ].map(t => (
                          <button key={t.value} onClick={() => setListingType(t.value)}
                            className={cn('p-4 rounded-xl border text-left transition-all', listingType === t.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30')}>
                            <p className="font-medium text-sm">{t.label}</p>
                            <p className="text-xs text-muted-foreground">{t.desc}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Setor</Label>
                      <p className="text-sm text-muted-foreground mb-3">Selecione o setor do produto</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {sectors?.map(s => (
                          <button key={s.id} onClick={() => { setSelectedSector(s.id); setSelectedCategory(''); }}
                            className={cn('p-3 rounded-xl border text-left transition-all', selectedSector === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30')}>
                            <span className="text-lg">{s.emoji}</span>
                            <p className="text-sm font-medium mt-1">{s.name}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {selectedSector && categories && categories.length > 0 && (
                      <div>
                        <Label className="text-base font-semibold">Categoria</Label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                          <SelectTrigger className="rounded-xl mt-2"><SelectValue placeholder="Selecione a categoria" /></SelectTrigger>
                          <SelectContent>
                            {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 1: Details */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-base font-semibold">Título *</Label>
                      <p className="text-sm text-muted-foreground mb-2">Seja claro e objetivo</p>
                      <Input id="title" placeholder="Ex: iPhone 14 Pro Max 256GB" value={title} onChange={e => setTitle(e.target.value)} className="rounded-xl text-base" maxLength={120} />
                      <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/120</p>
                    </div>
                    <div>
                      <Label htmlFor="desc" className="text-base font-semibold">Descrição</Label>
                      <Textarea id="desc" placeholder="Descreva detalhes, estado de conservação, o que acompanha..." value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl resize-none" rows={5} />
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Condição</Label>
                      <div className="grid grid-cols-3 gap-3 mt-2">
                        {(['new', 'used', 'refurbished'] as const).map(c => (
                          <button key={c} onClick={() => setCondition(c)}
                            className={cn('p-3 rounded-xl border text-center transition-all', condition === c ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-muted-foreground/30')}>
                            <p className="text-sm font-medium">{conditionLabels[c]}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Dynamic Attributes */}
                    {categoryAttributes && categoryAttributes.length > 0 && (
                      <div className="space-y-4 pt-4 border-t">
                        <Label className="text-base font-semibold">Características</Label>
                        {categoryAttributes.map(attr => (
                          <DynamicInput key={attr.id} attribute={attr} value={attributes[attr.slug] || ''} onChange={v => setAttributes(prev => ({ ...prev, [attr.slug]: v }))} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 2: Media */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <Label className="text-base font-semibold">Fotos do produto *</Label>
                        <p className="text-sm text-muted-foreground">Adicione até 10 fotos. A primeira será a capa.</p>
                      </div>
                      <Badge variant="secondary">{media.length}/10</Badge>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {media.map((item, index) => (
                        <div key={index} className={cn('relative aspect-square rounded-xl overflow-hidden border-2 group', item.is_primary ? 'border-primary' : 'border-transparent')}>
                          <img src={item.url} alt="" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg" onClick={() => setPrimaryImage(index)}>
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-lg" onClick={() => removeImage(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          {item.is_primary && (
                            <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Capa</span>
                          )}
                        </div>
                      ))}
                      {media.length < 10 && (
                        <label className="aspect-square rounded-xl border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Plus className="h-6 w-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">Adicionar</span>
                          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 3: Pricing */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <Label htmlFor="price" className="text-base font-semibold">Preço (R$) *</Label>
                      <p className="text-sm text-muted-foreground mb-2">Defina o valor do produto</p>
                      <Input id="price" type="number" step="0.01" min="0" placeholder="0,00" value={price} onChange={e => setPrice(e.target.value)} className="rounded-xl text-2xl font-bold h-14" />
                    </div>
                    <div>
                      <Label htmlFor="stock" className="text-base font-semibold">Estoque</Label>
                      <Input id="stock" type="number" min="1" value={stock} onChange={e => setStock(e.target.value)} className="rounded-xl mt-2" />
                    </div>
                    {listingType === 'accepts_offers' && (
                      <div className="pt-4 border-t space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="font-semibold">Aceitar ofertas</Label>
                            <p className="text-xs text-muted-foreground">Compradores podem negociar o preço</p>
                          </div>
                          <Switch checked={allowOffers} onCheckedChange={setAllowOffers} />
                        </div>
                        {allowOffers && (
                          <div>
                            <Label htmlFor="minOffer">Valor mínimo da oferta (R$)</Label>
                            <Input id="minOffer" type="number" step="0.01" placeholder="Opcional" value={minOfferPrice} onChange={e => setMinOfferPrice(e.target.value)} className="rounded-xl mt-1" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* STEP 4: Review */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                <Card className="rounded-2xl">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-primary" />
                      <h2 className="text-base font-semibold">Revisão do anúncio</h2>
                    </div>

                    {/* Review sections */}
                    <ReviewSection label="Categoria" onEdit={() => setStep(0)}>
                      <p className="text-sm">{selectedSectorObj?.emoji} {selectedSectorObj?.name} {selectedCategoryName && `→ ${selectedCategoryName}`}</p>
                      <Badge variant="secondary" className="mt-1">{listingType === 'fixed_price' ? 'Preço Fixo' : 'Aceita Ofertas'}</Badge>
                    </ReviewSection>

                    <ReviewSection label="Detalhes" onEdit={() => setStep(1)}>
                      <p className="font-medium">{title}</p>
                      {description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{description}</p>}
                      <Badge variant="outline" className="mt-1">{conditionLabels[condition]}</Badge>
                    </ReviewSection>

                    <ReviewSection label="Fotos" onEdit={() => setStep(2)}>
                      <div className="flex gap-2 overflow-x-auto">
                        {media.map((m, i) => (
                          <div key={i} className={cn('w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2', m.is_primary ? 'border-primary' : 'border-transparent')}>
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{media.length} foto(s)</p>
                    </ReviewSection>

                    <ReviewSection label="Preço & Estoque" onEdit={() => setStep(3)}>
                      <p className="text-2xl font-bold text-primary">R$ {formatPrice(price)}</p>
                      <p className="text-sm text-muted-foreground">{stock} unidade(s) em estoque</p>
                      {allowOffers && <Badge variant="secondary" className="mt-1">Aceita ofertas</Badge>}
                    </ReviewSection>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Live Preview Sidebar */}
          <div className="lg:col-span-2 hidden lg:block">
            <div className="sticky top-32">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Pré-visualização</p>
              <div className="rounded-2xl border bg-card overflow-hidden">
                {/* Preview Image */}
                <div className="aspect-square bg-muted relative">
                  {media.length > 0 ? (
                    <img src={(media.find(m => m.is_primary) || media[0]).url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Package className="h-12 w-12 mb-2" />
                      <p className="text-xs">Adicione fotos</p>
                    </div>
                  )}
                  {media.length > 1 && (
                    <span className="absolute bottom-2 right-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded-full">
                      +{media.length - 1}
                    </span>
                  )}
                </div>
                {/* Preview Details */}
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold line-clamp-2 text-sm">
                    {title || 'Título do produto'}
                  </h3>
                  {price ? (
                    <p className="text-lg font-bold text-primary">R$ {formatPrice(price)}</p>
                  ) : (
                    <p className="text-lg font-bold text-muted-foreground">R$ 0,00</p>
                  )}
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{conditionLabels[condition]}</Badge>
                    {allowOffers && <Badge variant="secondary" className="text-xs">Aceita ofertas</Badge>}
                  </div>
                  {selectedSectorObj && (
                    <p className="text-xs text-muted-foreground">{selectedSectorObj.emoji} {selectedSectorObj.name}{selectedCategoryName ? ` → ${selectedCategoryName}` : ''}</p>
                  )}
                  <div className="flex items-center gap-2 pt-2 border-t mt-2">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-primary">{store.name.charAt(0)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{store.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t p-4 z-40 lg:pl-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button variant="ghost" onClick={() => step > 0 ? setStep(step - 1) : navigate('/app/store/products')} className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {step > 0 ? 'Voltar' : 'Cancelar'}
          </Button>
          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canNext()} className="rounded-xl">
              Próximo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-xl">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
              {isSubmitting ? 'Publicando...' : 'Publicar Anúncio'}
            </Button>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

function ReviewSection({ label, onEdit, children }: { label: string; onEdit: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 pb-4 border-b last:border-0 last:pb-0">
      <div className="flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
        {children}
      </div>
      <Button variant="ghost" size="sm" onClick={onEdit} className="rounded-lg text-xs text-primary">Editar</Button>
    </div>
  );
}

function DynamicInput({ attribute, value, onChange }: { attribute: CategoryAttribute; value: string; onChange: (v: string) => void }) {
  const { name, input_type, options, is_required } = attribute;

  if (input_type === 'select' && options) {
    return (
      <div>
        <Label>{name} {is_required && '*'}</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Selecione" /></SelectTrigger>
          <SelectContent>
            {(options as string[]).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (input_type === 'boolean') {
    return (
      <div className="flex items-center justify-between">
        <Label>{name} {is_required && '*'}</Label>
        <Switch checked={value === 'true'} onCheckedChange={v => onChange(v ? 'true' : 'false')} />
      </div>
    );
  }

  return (
    <div>
      <Label>{name} {is_required && '*'}</Label>
      <Input type={input_type === 'number' ? 'number' : 'text'} value={value} onChange={e => onChange(e.target.value)} className="rounded-xl mt-1" />
    </div>
  );
}
