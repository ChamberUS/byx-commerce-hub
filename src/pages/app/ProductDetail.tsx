import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Heart, Share2, MessageCircle, ShoppingCart, 
  Store, Star, MapPin, ChevronLeft, ChevronRight, Tag,
  Shield, Truck, RotateCcw
} from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
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

  const storeInitials = product.store?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'L';

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header - Mobile */}
        <div className="sticky top-0 bg-background/95 backdrop-blur z-30 px-4 py-3 border-b md:hidden">
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

        <div className="md:grid md:grid-cols-2 md:gap-8 md:p-6">
          {/* Image Gallery */}
          <div className="relative">
            <div className="aspect-square bg-muted">
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
                  onClick={() => setCurrentImageIndex(i => i > 0 ? i - 1 : images.length - 1)}
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
                  onClick={() => setCurrentImageIndex(i => i < images.length - 1 ? i + 1 : 0)}
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
                
                {/* Thumbnails */}
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setCurrentImageIndex(i)}
                      className={cn(
                        'w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-colors',
                        i === currentImageIndex ? 'border-primary' : 'border-transparent'
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
          <div className="px-4 py-6 md:px-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">{conditionLabels[product.condition]}</Badge>
              {product.allow_offers && (
                <Badge className="bg-success text-success-foreground">Aceita oferta</Badge>
              )}
              {product.category && (
                <Badge variant="outline">{product.category.name}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold mb-2">{product.title}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-muted-foreground">BYX</span>
              {product.price_brl_ref && (
                <span className="text-sm text-muted-foreground">
                  (~R$ {formatPrice(product.price_brl_ref)})
                </span>
              )}
            </div>

            {/* Stock */}
            <p className="text-sm text-muted-foreground mb-6">
              {product.stock_quantity > 1 
                ? `${product.stock_quantity} unidades disponíveis` 
                : product.stock_quantity === 1 
                  ? 'Última unidade!' 
                  : 'Esgotado'}
            </p>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              <Button className="flex-1 h-12 rounded-xl" size="lg" onClick={handleBuyNow}>
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
                variant="secondary" 
                className="w-full h-11 rounded-xl mb-6"
                onClick={handleContact}
              >
                <Tag className="mr-2 h-4 w-4" />
                Fazer uma oferta
              </Button>
            )}

            <Separator className="my-6" />

            {/* Store Info */}
            <Link 
              to={`/app/store/${product.store?.slug}`}
              className="flex items-center gap-4 p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            >
              <Avatar className="h-14 w-14 border-2 border-background">
                <AvatarImage src={product.store?.logo_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">{product.store?.name}</h3>
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
              <Store className="h-5 w-5 text-muted-foreground" />
            </Link>

            <Separator className="my-6" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Descrição</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {product.description || 'Sem descrição disponível.'}
              </p>
            </div>

            {/* Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3">Características</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground capitalize">{key}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trust Signals */}
            <div className="grid grid-cols-3 gap-3 py-4">
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Shield className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <Truck className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Entrega</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/50">
                <RotateCcw className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs text-muted-foreground">Devolução</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
