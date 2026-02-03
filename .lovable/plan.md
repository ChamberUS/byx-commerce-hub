
# Correção de Erros de Tipo e Botão Comprar Agora

## Resumo das Alterações

Este plano corrige os erros de compilação TypeScript identificados e adiciona o botão "Comprar Agora" funcional na página de produto.

---

## Erros Identificados

### 1. ChatRoom.tsx - Linha 149
**Erro**: `'status' does not exist in type`
**Causa**: O `useRespondToOffer` espera `action` mas o código passa `status`
**Solução**: Mudar `status: action` para `action: action === 'accepted' ? 'accept' : 'reject'`

### 2. ChatRoom.tsx - Linhas 464-465
**Erro**: `Property 'message' does not exist on type`
**Causa**: O tipo `Message.offer` não inclui `message`, apenas `id`, `amount`, `status`, `counter_amount`
**Solução**: Expandir o tipo `offer` na interface `Message` para incluir `message`

### 3. QuickReplies.tsx - Linha 101
**Erro**: `Property 'storeId' is missing`
**Causa**: `useUpdateQuickReply` espera `storeId` mas não está sendo passado
**Solução**: Adicionar `storeId: store.id` na chamada

### 4. QuickReplies.tsx - Linha 125
**Erro**: `Argument of type 'string' is not assignable`
**Causa**: `useDeleteQuickReply` espera `{ id, storeId }` mas recebe apenas `string`
**Solução**: Passar objeto `{ id: deleteReplyId, storeId: store.id }`

---

## Arquivos a Modificar

### 1. `src/hooks/use-chat.ts`
- Expandir o tipo `offer` na interface `Message` para incluir campo `message`

### 2. `src/pages/app/ChatRoom.tsx`
- Corrigir chamada `handleRespondToOffer` para usar `action` em vez de `status`
- Mapear 'accepted'/'rejected' para 'accept'/'reject'

### 3. `src/pages/seller/QuickReplies.tsx`
- Adicionar `storeId` na chamada de `updateQuickReply`
- Corrigir chamada de `deleteQuickReply` para passar objeto

### 4. `src/pages/app/ProductDetail.tsx`
- Adicionar handler `handleBuyNow` que:
  - Verifica se usuário está logado
  - Armazena produto no sessionStorage
  - Redireciona para `/app/checkout`

---

## Detalhes Técnicos

### Correção do tipo Message.offer
```typescript
offer?: {
  id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'cancelled';
  counter_amount: number | null;
  message: string | null;  // Adicionar este campo
};
```

### Correção handleRespondToOffer
```typescript
const handleRespondToOffer = async (offerId: string, action: 'accepted' | 'rejected', counterAmount?: number) => {
  await respondToOffer.mutateAsync({
    offerId,
    conversationId,  // Adicionar conversationId
    action: action === 'accepted' ? 'accept' : 'reject',  // Mapear corretamente
    counterAmount,
  });
};
```

### Handler Comprar Agora
```typescript
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
```

---

## Resultado Esperado

- Build passa sem erros TypeScript
- Botão "Comprar Agora" redireciona para checkout com dados do produto
- Chat funciona corretamente com ofertas e contra-ofertas
- Quick Replies podem ser editadas e deletadas sem erros
