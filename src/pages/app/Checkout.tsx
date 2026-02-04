import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Minus, Plus, Trash2, MapPin, CreditCard, Wallet, Loader2, Shield, Check } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useCreateOrder, useUpdateOrderStatus } from '@/hooks/use-orders';
import { useProduct } from '@/hooks/use-products';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variationId?: string;
}

interface CheckoutProduct {
  id: string;
  title: string;
  price: number;
  store_id: string;
  image: string;
}

type CheckoutStep = 'review' | 'address' | 'payment' | 'confirmation';

export default function Checkout() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  const updateOrderStatus = useUpdateOrderStatus();
  
  const [step, setStep] = useState<CheckoutStep>('review');
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeId, setStoreId] = useState<string>('');
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  
  // Load product from sessionStorage
  useEffect(() => {
    const storedProduct = sessionStorage.getItem('checkout_product');
    if (storedProduct) {
      const product: CheckoutProduct = JSON.parse(storedProduct);
      setItems([{
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity: 1,
        imageUrl: product.image,
      }]);
      setStoreId(product.store_id);
    }
  }, []);

  // Load store info
  const firstProductId = items[0]?.productId;
  const { data: productData } = useProduct(firstProductId || '');

  if (items.length === 0) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground mb-6">
            Adicione produtos para continuar com a compra.
          </p>
          <Button onClick={() => navigate('/app/search')} className="rounded-xl">
            Explorar Produtos
          </Button>
        </div>
      </AppLayout>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = 0; // Free shipping for MVP
  const total = subtotal + shippingCost;

  const updateQuantity = (index: number, delta: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty };
    }));
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    if (items.length === 1) {
      sessionStorage.removeItem('checkout_product');
    }
  };

  const validateAddress = () => {
    if (!shippingAddress.street || !shippingAddress.number || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast({
        variant: 'destructive',
        title: 'Preencha o endereço de entrega',
      });
      return false;
    }
    return true;
  };

  const handleCreateOrder = async () => {
    if (!validateAddress()) return;

    setIsSubmitting(true);
    try {
      const order = await createOrder.mutateAsync({
        storeId,
        items: items.map(item => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          variationId: item.variationId,
        })),
        shippingCost,
        shippingAddress,
        notes: notes || undefined,
      });

      setOrderId(order.id);
      setStep('payment');
      sessionStorage.removeItem('checkout_product');
    } catch (error) {
      console.error('Order error:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao criar pedido',
        description: 'Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayWithAIOS = async () => {
    if (!orderId) return;

    setIsPaying(true);
    try {
      // Simulate payment delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update order status to paid
      await updateOrderStatus.mutateAsync({
        orderId,
        status: 'paid',
      });

      setStep('confirmation');
      toast({ title: 'Pagamento confirmado!' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro ao processar pagamento',
        description: 'Tente novamente.',
      });
    } finally {
      setIsPaying(false);
    }
  };

  const storeName = productData?.store?.name || 'Loja';
  const storeLogoUrl = productData?.store?.logo_url;
  const storeInitials = storeName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Step: Confirmation
  if (step === 'confirmation') {
    return (
      <AppLayout>
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
          <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="h-10 w-10 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
          <p className="text-muted-foreground mb-6">
            Seu pagamento foi processado com sucesso. O vendedor foi notificado e em breve enviará seu produto.
          </p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">Total pago</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(total)} BYX</p>
          </div>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(`/app/orders/${orderId}`)} className="rounded-xl">
              Ver Pedido
            </Button>
            <Button variant="outline" onClick={() => navigate('/app')} className="rounded-xl">
              Voltar para Home
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Step: Payment
  if (step === 'payment') {
    return (
      <AppLayout>
        <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <h1 className="text-lg font-semibold">Pagamento</h1>
          </div>
        </header>

        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Pagar com AIOS/BYX</h3>
                  <p className="text-sm text-muted-foreground">Pagamento instantâneo e sem taxas</p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)} BYX</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="text-success">Grátis</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)} BYX</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-success/10 border border-success/20 mb-6">
                <div className="flex items-center gap-2 text-success">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Compra Protegida BYX</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Seu pagamento fica em escrow até você confirmar o recebimento
                </p>
              </div>

              <Button 
                className="w-full h-12 rounded-xl" 
                size="lg"
                onClick={handlePayWithAIOS}
                disabled={isPaying}
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Wallet className="mr-2 h-5 w-5" />
                    Pagar {formatPrice(total)} BYX
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

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
          <h1 className="text-lg font-semibold">Finalizar Compra</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Store Info */}
        <Card className="rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={storeLogoUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{storeName}</p>
                <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Itens do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium line-clamp-1">{item.title}</h4>
                  <p className="text-sm text-primary font-semibold">{formatPrice(item.price)} BYX</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => updateQuantity(index, -1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() => updateQuantity(index, 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-destructive hover:text-destructive ml-auto"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Endereço de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <Label htmlFor="street">Rua *</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  value={shippingAddress.street}
                  onChange={e => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="number">Nº *</Label>
                <Input
                  id="number"
                  placeholder="123"
                  value={shippingAddress.number}
                  onChange={e => setShippingAddress(prev => ({ ...prev, number: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="complement">Complemento</Label>
              <Input
                id="complement"
                placeholder="Apto, bloco, etc."
                value={shippingAddress.complement}
                onChange={e => setShippingAddress(prev => ({ ...prev, complement: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Bairro</Label>
              <Input
                id="neighborhood"
                placeholder="Bairro"
                value={shippingAddress.neighborhood}
                onChange={e => setShippingAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  placeholder="Cidade"
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  placeholder="SP"
                  maxLength={2}
                  value={shippingAddress.state}
                  onChange={e => setShippingAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                  className="rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="zipCode">CEP *</Label>
              <Input
                id="zipCode"
                placeholder="00000-000"
                value={shippingAddress.zipCode}
                onChange={e => setShippingAddress(prev => ({ ...prev, zipCode: e.target.value }))}
                className="rounded-xl"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Alguma observação para o vendedor? (opcional)"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="rounded-xl resize-none"
              rows={3}
            />
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 pb-safe">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatPrice(subtotal)} BYX</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Frete</span>
              <span className="text-success">{shippingCost === 0 ? 'Grátis' : `${formatPrice(shippingCost)} BYX`}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(total)} BYX</span>
            </div>
          </div>
          <Button
            className="w-full h-12 rounded-xl"
            size="lg"
            onClick={handleCreateOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-5 w-5" />
                Continuar para Pagamento
              </>
            )}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
