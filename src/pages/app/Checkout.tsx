import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Package, Minus, Plus, Trash2, MapPin, CreditCard } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCreateOrder } from '@/hooks/use-orders';
import { useToast } from '@/hooks/use-toast';

interface CartItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  variationId?: string;
}

interface CheckoutState {
  storeId: string;
  storeName: string;
  storeLogoUrl?: string;
  items: CartItem[];
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const createOrder = useCreateOrder();
  
  const checkoutState = location.state as CheckoutState | null;
  
  const [items, setItems] = useState<CartItem[]>(checkoutState?.items || []);
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

  if (!checkoutState || items.length === 0) {
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
  };

  const handleSubmit = async () => {
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zipCode) {
      toast({
        variant: 'destructive',
        title: 'Preencha o endereço de entrega',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder.mutateAsync({
        storeId: checkoutState.storeId,
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

      toast({ title: 'Pedido criado com sucesso!' });
      navigate(`/app/orders/${order.id}`, { replace: true });
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

  const storeInitials = checkoutState.storeName
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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
                <AvatarImage src={checkoutState.storeLogoUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {storeInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{checkoutState.storeName}</p>
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
                <Label htmlFor="street">Rua</Label>
                <Input
                  id="street"
                  placeholder="Nome da rua"
                  value={shippingAddress.street}
                  onChange={e => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="number">Nº</Label>
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
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  placeholder="Cidade"
                  value={shippingAddress.city}
                  onChange={e => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                  className="rounded-xl"
                />
              </div>
              <div>
                <Label htmlFor="state">Estado</Label>
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
              <Label htmlFor="zipCode">CEP</Label>
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
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            <CreditCard className="mr-2 h-5 w-5" />
            {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
