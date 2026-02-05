 import { useState } from 'react';
 import { useParams, useNavigate, Link } from 'react-router-dom';
 import { 
   ArrowLeft, Heart, Share2, MessageCircle, ShoppingCart, 
   Store, Star, MapPin, ChevronLeft, ChevronRight, Tag,
   Shield, Truck, RotateCcw, Check, Eye, BadgeCheck, 
   ExternalLink, Zap, Package
 } from 'lucide-react';
 import { AppLayout } from '@/components/layout/AppLayout';
 import { Button } from '@/components/ui/button';
 import { Badge } from '@/components/ui/badge';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Skeleton } from '@/components/ui/skeleton';
 import { Separator } from '@/components/ui/separator';
 import { Card, CardContent } from '@/components/ui/card';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useProduct } from '@/hooks/use-products';
 import { useToggleFavoriteProduct, useIsProductFavorite } from '@/hooks/use-favorites';
 import { useCreateConversation } from '@/hooks/use-chat';
 import { useAuth } from '@/contexts/AuthContext';
 import { useToast } from '@/hooks/use-toast';
 import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { data: product, isLoading } = useProduct(id || '');
  const { data: isFavorite } = useIsProductFavorite(id || '');
  const toggleFavorite = useToggleFavoriteProduct();
  const createConversation = useCreateConversation();
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Skeleton className="aspect-square md:aspect-video rounded-2xl mb-6" />
          <Skeleton className="h-8 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-24 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Produto não encontrado</h2>
          <p className="text-muted-foreground mb-4">Este produto pode ter sido removido ou não existe.</p>
          <Button asChild>
            <Link to="/app/search">Voltar ao Marketplace</Link>
          </Button>
        </div>
      </AppLayout>
    );
  }

  const images = product.product_media?.sort((a, b) => a.sort_order - b.sort_order) || [];
  const currentImage = images[currentImageIndex]?.url || '/placeholder.svg';

  const conditionLabels = {
    new: 'Novo',
    used: 'Usado',
    refurbished: 'Recondicionado',
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const handleContact = async () => {
    if (!user) {
      toast({ title: 'Faça login para entrar em contato', variant: 'destructive' });
      return;
    }

    try {
      const conversation = await createConversation.mutateAsync({
        storeId: product.store!.id,
        productId: product.id,
      });
      navigate(`/app/chat/${conversation.id}`);
    } catch {
      toast({ title: 'Erro ao iniciar conversa', variant: 'destructive' });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: product.title,
        text: `Confira este produto no BYX: ${product.title}`,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: 'Link copiado!' });
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      toast({ title: 'Faça login para comprar', variant: 'destructive' });
      navigate('/auth/login');
      return;
    }
    
    sessionStorage.setItem('checkout_product', JSON.stringify({
      id: product.id,
      title: product.title,
      price: product.price,
      store_id: product.store?.id,
      image: images[0]?.url || '/placeholder.svg'
    }));
    
    navigate('/app/checkout');
  };
 
   const handleMakeOffer = async () => {
     if (!user) {
       toast({ title: 'Faça login para fazer uma oferta', variant: 'destructive' });
       navigate('/auth/login');
       return;
     }
     await handleContact();
   };

  const storeInitials = product.store?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  return (
    <AppLayout>
       <div className="max-w-7xl mx-auto">
        {/* Header - Mobile */}
         <div className="sticky top-0 bg-background/95 backdrop-blur z-30 px-4 py-3 border-b lg:hidden">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => user && toggleFavorite.mutate(product.id)}
                className={cn(isFavorite && 'text-destructive')}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
              </Button>
            </div>
          </div>
        </div>

         <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:p-6">
          {/* Image Gallery */}
           <div className="lg:col-span-5 relative">
             <div className="aspect-square bg-muted lg:rounded-2xl overflow-hidden">
              <img
                src={currentImage}
                alt={product.title}
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Image Navigation */}
            {images.length > 1 && (
              <>
                <Button
                  size="icon"
                  variant="secondary"
                     className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 shadow-lg"
                  onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                     className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 shadow-lg"
                  onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                {/* Thumbnails */}
                   <div className="flex gap-2 p-4 overflow-x-auto lg:justify-center">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                           'w-16 h-16 lg:w-20 lg:h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all',
                           i === currentImageIndex ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/30'
                      )}
                    >
                      <img src={img.url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Product Info */}
           <div className="lg:col-span-4 px-4 py-6 lg:px-0">
            {/* Badges */}
             <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{conditionLabels[product.condition]}</Badge>
              {product.allow_offers && (
                 <Badge className="bg-success/10 text-success border-success/20">
                   <Tag className="h-3 w-3 mr-1" />
                   Aceita oferta
                 </Badge>
               )}
             </div>
 
             {/* Title */}
             <h1 className="text-2xl lg:text-3xl font-bold mb-4 leading-tight">{product.title}</h1>
 
             {/* Social Proof */}
             <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
               {product.views_count > 0 && (
                 <span className="flex items-center gap-1">
                   <Eye className="h-4 w-4" />
                   {product.views_count} views
                 </span>
               )}
               {product.favorites_count > 0 && (
                 <span className="flex items-center gap-1">
                   <Heart className="h-4 w-4" />
                   {product.favorites_count} salvos
                 </span>
              )}
            </div>

            {/* Price */}
             <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
               <div className="flex items-baseline gap-2">
                 <span className="text-3xl lg:text-4xl font-bold text-primary">
                   {formatPrice(product.price)}
                 </span>
                 <span className="text-lg text-primary/70">BYX</span>
               </div>
              {product.price_brl_ref && (
                 <p className="text-sm text-muted-foreground mt-1">
                  (~R$ {formatPrice(product.price_brl_ref)})
                 </p>
              )}
            </div>

            {/* Stock */}
             <div className="flex items-center gap-2 mb-6">
               {product.stock_quantity > 0 ? (
                 <>
                   <Check className="h-4 w-4 text-success" />
                   <span className="text-sm">
                     {product.stock_quantity > 1 
                       ? `${product.stock_quantity} disponíveis` 
                       : <span className="text-warning font-medium">Última unidade!</span>}
                   </span>
                 </>
               ) : (
                 <Badge variant="destructive">Esgotado</Badge>
               )}
             </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
               <Button className="flex-1 h-12 rounded-xl font-semibold" size="lg" onClick={handleBuyNow}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Comprar Agora
              </Button>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl px-4"
                onClick={handleContact}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                className={cn(
                  'h-12 rounded-xl px-4 hidden md:flex',
                  isFavorite && 'text-destructive border-destructive'
                )}
                onClick={() => user && toggleFavorite.mutate(product.id)}
              >
                <Heart className={cn('h-5 w-5', isFavorite && 'fill-current')} />
              </Button>
            </div>

            {/* Make Offer */}
            {product.allow_offers && (
              <Button 
                 variant="outline" 
                 className="w-full h-11 rounded-xl mb-6 border-dashed"
                 onClick={handleMakeOffer}
              >
                <Tag className="mr-2 h-4 w-4" />
                 Negociar preço
              </Button>
            )}
 
             {/* Trust Signals */}
             <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-muted/50 mb-6">
               <div className="flex flex-col items-center text-center p-2">
                 <Shield className="h-5 w-5 text-primary mb-1" />
                 <span className="text-xs text-muted-foreground">Compra Protegida</span>
               </div>
               <div className="flex flex-col items-center text-center p-2">
                 <Truck className="h-5 w-5 text-primary mb-1" />
                 <span className="text-xs text-muted-foreground">Entrega</span>
               </div>
               <div className="flex flex-col items-center text-center p-2">
                 <RotateCcw className="h-5 w-5 text-primary mb-1" />
                 <span className="text-xs text-muted-foreground">Devolução</span>
               </div>
             </div>

            <Separator className="my-6" />

            {/* Store Info */}
            <Link 
              to={`/app/store/${product.store?.slug}`}
               className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary/50 transition-all group"
            >
               <Avatar className="h-14 w-14 border-2 border-background shadow-md">
                <AvatarImage src={product.store?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                 <div className="flex items-center gap-2">
                   <h3 className="font-semibold group-hover:text-primary transition-colors">{product.store?.name}</h3>
                 </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {product.store?.rating_avg && product.store.rating_avg > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      {product.store.rating_avg.toFixed(1)}
                    </span>
                  )}
                  {product.store?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {product.store.city}
                    </span>
                  )}
                </div>
              </div>
               <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </Link>
 
             {product.category && (
               <div className="mt-4">
                 <Badge variant="outline" className="text-xs">{product.category.name}</Badge>
               </div>
             )}
           </div>
 
           {/* Right Sidebar - Desktop */}
           <div className="hidden lg:block lg:col-span-3">
             <div className="sticky top-24 space-y-4">
               <Card>
                 <CardContent className="pt-6 space-y-3">
                   <Button className="w-full h-12 rounded-xl font-semibold" size="lg" onClick={handleBuyNow}>
                     <Zap className="mr-2 h-5 w-5" />
                     Comprar Agora
                   </Button>
                   <Button variant="outline" className="w-full h-10 rounded-xl" onClick={handleContact}>
                     <MessageCircle className="mr-2 h-4 w-4" />
                     Perguntar
                   </Button>
                   {product.allow_offers && (
                     <Button variant="secondary" className="w-full h-10 rounded-xl" onClick={handleMakeOffer}>
                       <Tag className="mr-2 h-4 w-4" />
                       Fazer Oferta
                     </Button>
                   )}
                   <div className="flex gap-2 pt-2">
                     <Button 
                       variant="ghost" 
                       className={cn('flex-1 rounded-xl', isFavorite && 'text-destructive')}
                       onClick={() => user && toggleFavorite.mutate(product.id)}
                     >
                       <Heart className={cn('h-4 w-4 mr-2', isFavorite && 'fill-current')} />
                       {isFavorite ? 'Salvo' : 'Salvar'}
                     </Button>
                     <Button variant="ghost" className="flex-1 rounded-xl" onClick={handleShare}>
                       <Share2 className="h-4 w-4 mr-2" />
                       Compartilhar
                     </Button>
                   </div>
                 </CardContent>
               </Card>
 
               <Card className="bg-primary/5 border-primary/20">
                 <CardContent className="pt-6">
                   <div className="flex items-start gap-3 mb-4">
                     <div className="p-2 rounded-lg bg-primary/10">
                       <Shield className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                       <h4 className="font-semibold text-sm">Compra Protegida</h4>
                       <p className="text-xs text-muted-foreground mt-1">
                         Pagamento em escrow até confirmar recebimento.
                       </p>
                     </div>
                   </div>
                   <div className="space-y-2 text-xs text-muted-foreground">
                     <div className="flex items-center gap-2">
                       <Check className="h-3 w-3 text-success" />
                       <span>Devolução garantida</span>
                     </div>
                     <div className="flex items-center gap-2">
                       <Check className="h-3 w-3 text-success" />
                       <span>Suporte a disputas</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </div>
           </div>
         </div>
 
         {/* Tabs Section */}
         <div className="px-4 lg:px-6 pb-8">
           <Tabs defaultValue="description" className="w-full">
             <TabsList className="w-full justify-start overflow-x-auto h-12 bg-muted/50 rounded-xl p-1">
               <TabsTrigger value="description" className="rounded-lg">Descrição</TabsTrigger>
               <TabsTrigger value="specs" className="rounded-lg">Especificações</TabsTrigger>
               <TabsTrigger value="shipping" className="rounded-lg">Envio</TabsTrigger>
             </TabsList>

             <TabsContent value="description" className="mt-6">
               <Card>
                 <CardContent className="pt-6">
                   {product.description ? (
                     <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
                   ) : (
                     <p className="text-center py-8 text-muted-foreground">Sem descrição.</p>
                   )}
                 </CardContent>
               </Card>
             </TabsContent>
 
             <TabsContent value="specs" className="mt-6">
               <Card>
                 <CardContent className="pt-6">
                   <div className="grid sm:grid-cols-2 gap-4">
                     {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                       <div key={key} className="flex justify-between p-3 rounded-lg bg-muted/50">
                         <span className="text-muted-foreground capitalize">{key}</span>
                         <span className="font-medium">{value}</span>
                       </div>
                     ))}
                     <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                       <span className="text-muted-foreground">Condição</span>
                       <span className="font-medium">{conditionLabels[product.condition]}</span>
                     </div>
                     <div className="flex justify-between p-3 rounded-lg bg-muted/50">
                       <span className="text-muted-foreground">Estoque</span>
                       <span className="font-medium">{product.stock_quantity}</span>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
 
             <TabsContent value="shipping" className="mt-6">
               <Card>
                 <CardContent className="pt-6">
                   <div className="space-y-4">
                     <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                       <Truck className="h-5 w-5 text-primary mt-0.5" />
                       <div>
                         <h4 className="font-medium">Envio</h4>
                         <p className="text-sm text-muted-foreground">
                           Prazo e custo a combinar com o vendedor.
                         </p>
                       </div>
                     </div>
                     <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                       <RotateCcw className="h-5 w-5 text-primary mt-0.5" />
                       <div>
                         <h4 className="font-medium">Devolução</h4>
                         <p className="text-sm text-muted-foreground">
                           Devolução em até 7 dias para defeitos.
                         </p>
                       </div>
                     </div>
                   </div>
                 </CardContent>
               </Card>
             </TabsContent>
           </Tabs>
         </div>
      </div>
    </AppLayout>
  );
}
