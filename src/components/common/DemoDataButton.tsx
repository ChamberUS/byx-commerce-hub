import { useState } from 'react';
import { Wand2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const DEMO_PRODUCTS = [
  { title: 'iPhone 14 Pro Max 256GB', price: 4500, condition: 'used', description: 'iPhone em perfeito estado, com caixa e acessórios originais.' },
  { title: 'MacBook Air M2 2023', price: 6800, condition: 'new', description: 'Novo, lacrado. Garantia Apple de 1 ano.' },
  { title: 'PlayStation 5 + 2 Controles', price: 3200, condition: 'used', description: 'PS5 com pouco uso, acompanha 2 controles DualSense.' },
  { title: 'Samsung Galaxy S23 Ultra', price: 3800, condition: 'new', description: 'Smartphone top de linha Samsung, lacrado.' },
  { title: 'Apple Watch Series 9', price: 2500, condition: 'new', description: 'Relógio inteligente Apple, GPS + Celular.' },
  { title: 'AirPods Pro 2ª Geração', price: 1200, condition: 'new', description: 'Fones de ouvido Apple com cancelamento de ruído.' },
];

export function DemoDataButton() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Only show in development
  if (import.meta.env.PROD) return null;
  if (!user || profile?.tipo_usuario !== 'lojista') return null;

  const createDemoData = async () => {
    if (!user) return;
    
    setIsCreating(true);
    try {
      // Check if user already has a store
      const { data: existingStore } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', user.id)
        .maybeSingle();

      let storeId = existingStore?.id;

      // Create store if not exists
      if (!storeId) {
        const { data: store, error: storeError } = await supabase
          .from('stores')
          .insert({
            owner_id: user.id,
            name: 'Loja Demo BYX',
            slug: `demo-${Date.now().toString(36)}`,
            description: 'Loja de demonstração com produtos variados',
            city: 'São Paulo',
            state: 'SP',
            is_verified: true,
          })
          .select()
          .single();

        if (storeError) throw storeError;
        storeId = store.id;

        // Create AIOS balance for store
        await supabase.from('aios_balances').insert({
          store_id: storeId,
          balance: 1500,
          total_earned: 2500,
          total_withdrawn: 1000,
        });
      }

      // Check existing products
      const { data: existingProducts } = await supabase
        .from('products')
        .select('id')
        .eq('store_id', storeId);

      if (existingProducts && existingProducts.length >= 6) {
        toast({ title: 'Dados demo já existem!' });
        setIsCreating(false);
        return;
      }

      // Create demo products
      for (const product of DEMO_PRODUCTS) {
        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert({
            store_id: storeId,
            title: product.title,
            slug: product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36),
            description: product.description,
            price: product.price,
            price_brl_ref: product.price * 5.5,
            condition: product.condition as 'new' | 'used',
            status: 'active',
            stock_quantity: Math.floor(Math.random() * 5) + 1,
            allow_offers: Math.random() > 0.5,
            views_count: Math.floor(Math.random() * 100),
            favorites_count: Math.floor(Math.random() * 20),
            published_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (productError) {
          console.error('Product error:', productError);
          continue;
        }

        // Add placeholder image
        await supabase.from('product_media').insert({
          product_id: newProduct.id,
          url: `https://picsum.photos/seed/${newProduct.id}/400/400`,
          is_primary: true,
          sort_order: 0,
        });
      }

      // Create demo quick replies
      const quickReplies = [
        { title: 'Saudação', content: 'Olá! Obrigado pelo interesse. Como posso ajudar?' },
        { title: 'Disponível', content: 'Sim, o produto está disponível! Posso te ajudar com mais informações?' },
        { title: 'Envio', content: 'Enviamos para todo o Brasil. O frete é calculado pelo CEP.' },
      ];

      // Create demo notifications
      await supabase.from('notifications').insert([
        {
          user_id: user.id,
          type: 'order',
          title: 'Novo pedido recebido!',
          body: 'Você recebeu um novo pedido de iPhone 14 Pro Max.',
          href: '/app/store/orders',
        },
        {
          user_id: user.id,
          type: 'message',
          title: 'Nova mensagem',
          body: 'Um comprador enviou uma pergunta sobre o MacBook.',
          href: '/app/chat',
        },
        {
          user_id: user.id,
          type: 'offer',
          title: 'Nova oferta recebida',
          body: 'R$ 3.500 pelo PlayStation 5.',
          href: '/app/chat',
        },
      ]);

      toast({ title: 'Dados demo criados com sucesso!' });
      window.location.reload();
    } catch (error: any) {
      console.error('Demo data error:', error);
      toast({ 
        variant: 'destructive', 
        title: 'Erro ao criar dados demo',
        description: error.message 
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={createDemoData}
      disabled={isCreating}
      className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
    >
      {isCreating ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wand2 className="mr-2 h-4 w-4" />
      )}
      {isCreating ? 'Criando...' : 'Criar Dados Demo'}
    </Button>
  );
}
