import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Send, Image, Tag, Zap, MoreVertical, 
  Package, Check, CheckCheck, X, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages, useSendMessage, useCreateOffer, useRespondToOffer, Message, Offer } from '@/hooks/use-chat';
import { useQuickReplies } from '@/hooks/use-quick-replies';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ConversationDetails {
  id: string;
  buyer_id: string;
  store_id: string;
  product_id: string | null;
  product?: { id: string; title: string; price: number; slug: string; product_media?: { url: string }[] };
  store?: { id: string; name: string; slug: string; logo_url: string | null; owner_id: string };
  buyer_profile?: { id: string; nome: string | null; avatar_url: string | null };
}

export default function ChatRoom() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [conversation, setConversation] = useState<ConversationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [messageText, setMessageText] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { data: messages, isLoading: loadingMessages } = useMessages(conversationId || '');
  const sendMessage = useSendMessage();
  const createOffer = useCreateOffer();
  const respondToOffer = useRespondToOffer();
  
  const isStoreOwner = conversation?.store?.owner_id === user?.id;
  const { data: quickReplies } = useQuickReplies(isStoreOwner ? conversation?.store_id || '' : '');

  useEffect(() => {
    if (!conversationId) return;
    
    const fetchConversation = async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          product:products(id, title, price, slug, product_media(url)),
          store:stores(id, name, slug, logo_url, owner_id)
        `)
        .eq('id', conversationId)
        .maybeSingle();
      
      if (error || !data) {
        navigate('/app/chat');
        return;
      }

      // Fetch buyer profile
      const { data: buyerProfile } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .eq('id', data.buyer_id)
        .maybeSingle();

      setConversation({ ...data, buyer_profile: buyerProfile } as ConversationDetails);
      setLoading(false);
    };

    fetchConversation();
  }, [conversationId, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversationId) return;
    
    try {
      await sendMessage.mutateAsync({
        conversationId,
        content: messageText.trim(),
        messageType: 'text',
      });
      setMessageText('');
      inputRef.current?.focus();
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao enviar mensagem' });
    }
  };

  const handleCreateOffer = async () => {
    if (!offerAmount || !conversation?.product_id) return;
    
    try {
      await createOffer.mutateAsync({
        conversationId: conversationId!,
        productId: conversation.product_id,
        amount: parseFloat(offerAmount),
        message: offerMessage || undefined,
      });
      setShowOfferModal(false);
      setOfferAmount('');
      setOfferMessage('');
      toast({ title: 'Oferta enviada!' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao enviar oferta' });
    }
  };

  const handleRespondToOffer = async (offerId: string, action: 'accepted' | 'rejected', counterAmount?: number) => {
    try {
      await respondToOffer.mutateAsync({
        offerId,
        conversationId: conversationId!,
        action: action === 'accepted' ? 'accept' : 'reject',
        counterAmount,
      });
      toast({ title: action === 'accepted' ? 'Oferta aceita!' : 'Oferta rejeitada' });
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao responder oferta' });
    }
  };

  const handleQuickReply = (content: string) => {
    setMessageText(content);
    setShowQuickReplies(false);
    inputRef.current?.focus();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  if (loading || loadingMessages) {
    return (
      <AppLayout hideNav>
        <div className="flex flex-col h-screen">
          <div className="p-4 border-b flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-2/3' : 'w-2/3 ml-auto')} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!conversation) return null;

  const otherParty = isStoreOwner
    ? { name: conversation.buyer_profile?.nome || 'Comprador', avatar: conversation.buyer_profile?.avatar_url }
    : { name: conversation.store?.name || 'Loja', avatar: conversation.store?.logo_url };

  const otherInitials = otherParty.name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AppLayout hideNav>
      <div className="flex flex-col h-screen bg-muted/30">
        {/* Header */}
        <header className="sticky top-0 bg-background z-40 border-b">
          <div className="flex items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/app/chat')}
              className="rounded-xl flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherParty.avatar || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {otherInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold truncate">{otherParty.name}</h1>
              {conversation.product && (
                <Link 
                  to={`/app/product/${conversation.product.id}`}
                  className="text-xs text-primary hover:underline truncate block"
                >
                  {conversation.product.title}
                </Link>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {conversation.product && (
                  <DropdownMenuItem asChild>
                    <Link to={`/app/product/${conversation.product.id}`}>
                      <Package className="mr-2 h-4 w-4" />
                      Ver Produto
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Product Banner */}
          {conversation.product && (
            <Link 
              to={`/app/product/${conversation.product.id}`}
              className="flex items-center gap-3 px-4 py-2 bg-muted/50 border-t"
            >
              <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {conversation.product.product_media?.[0]?.url ? (
                  <img 
                    src={conversation.product.product_media[0].url} 
                    alt={conversation.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{conversation.product.title}</p>
                <p className="text-xs text-primary font-semibold">{formatPrice(conversation.product.price)} BYX</p>
              </div>
            </Link>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages?.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.sender_id === user?.id}
              isStoreOwner={isStoreOwner}
              onRespondToOffer={handleRespondToOffer}
              formatPrice={formatPrice}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Replies */}
        {showQuickReplies && quickReplies && quickReplies.length > 0 && (
          <div className="border-t bg-background p-2 flex gap-2 overflow-x-auto">
            {quickReplies.map((qr) => (
              <Button
                key={qr.id}
                variant="outline"
                size="sm"
                className="rounded-full whitespace-nowrap flex-shrink-0"
                onClick={() => handleQuickReply(qr.content)}
              >
                {qr.title}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="sticky bottom-0 bg-background border-t p-3 pb-safe">
          <div className="flex items-center gap-2">
            {isStoreOwner && quickReplies && quickReplies.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl flex-shrink-0"
                onClick={() => setShowQuickReplies(!showQuickReplies)}
              >
                <Zap className={cn('h-5 w-5', showQuickReplies && 'text-primary')} />
              </Button>
            )}
            {!isStoreOwner && conversation.product && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl flex-shrink-0"
                onClick={() => setShowOfferModal(true)}
              >
                <Tag className="h-5 w-5" />
              </Button>
            )}
            <Input
              ref={inputRef}
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              className="rounded-xl"
            />
            <Button
              size="icon"
              className="rounded-xl flex-shrink-0"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessage.isPending}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      <Dialog open={showOfferModal} onOpenChange={setShowOfferModal}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Fazer uma Oferta</DialogTitle>
            <DialogDescription>
              {conversation.product && (
                <span>Produto: {conversation.product.title} - {formatPrice(conversation.product.price)} BYX</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer-amount">Valor da oferta (BYX)</Label>
              <Input
                id="offer-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="offer-message">Mensagem (opcional)</Label>
              <Textarea
                id="offer-message"
                placeholder="Gostaria de negociar..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="rounded-xl resize-none"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOfferModal(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button onClick={handleCreateOffer} disabled={!offerAmount || createOffer.isPending} className="rounded-xl">
              Enviar Oferta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function MessageBubble({
  message,
  isOwn,
  isStoreOwner,
  onRespondToOffer,
  formatPrice,
}: {
  message: Message;
  isOwn: boolean;
  isStoreOwner: boolean;
  onRespondToOffer: (offerId: string, action: 'accepted' | 'rejected', counterAmount?: number) => void;
  formatPrice: (price: number) => string;
}) {
  const [counterAmount, setCounterAmount] = useState('');
  const [showCounter, setShowCounter] = useState(false);

  if (message.message_type === 'system') {
    return (
      <div className="flex justify-center">
        <Badge variant="secondary" className="text-xs font-normal">
          {message.content}
        </Badge>
      </div>
    );
  }

  if (message.message_type === 'offer' && message.offer) {
    const offer = message.offer;
    const isPending = offer.status === 'pending';
    const canRespond = isStoreOwner && isPending;
    
    const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
      pending: { label: 'Pendente', color: 'bg-warning/10 text-warning', icon: <Clock className="h-3 w-3" /> },
      accepted: { label: 'Aceita', color: 'bg-success/10 text-success', icon: <Check className="h-3 w-3" /> },
      rejected: { label: 'Rejeitada', color: 'bg-destructive/10 text-destructive', icon: <X className="h-3 w-3" /> },
      countered: { label: 'Contra-oferta', color: 'bg-primary/10 text-primary', icon: <Tag className="h-3 w-3" /> },
      expired: { label: 'Expirada', color: 'bg-muted text-muted-foreground', icon: <Clock className="h-3 w-3" /> },
      cancelled: { label: 'Cancelada', color: 'bg-muted text-muted-foreground', icon: <X className="h-3 w-3" /> },
    };

    const status = statusConfig[offer.status || 'pending'];

    return (
      <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
        <div className={cn(
          'max-w-[85%] rounded-2xl p-4 border',
          isOwn ? 'bg-primary/5 border-primary/20' : 'bg-card'
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">Oferta</span>
            <Badge className={cn('ml-auto', status.color)}>
              {status.icon}
              <span className="ml-1">{status.label}</span>
            </Badge>
          </div>
          <p className="text-2xl font-bold text-primary mb-1">{formatPrice(offer.amount)} BYX</p>
          {offer.message && (
            <p className="text-sm text-muted-foreground mb-2">{offer.message}</p>
          )}
          {offer.counter_amount && (
            <p className="text-sm text-primary">Contra-oferta: {formatPrice(offer.counter_amount)} BYX</p>
          )}
          
          {canRespond && (
            <div className="mt-3 space-y-2">
              {showCounter ? (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Valor"
                    value={counterAmount}
                    onChange={(e) => setCounterAmount(e.target.value)}
                    className="rounded-xl flex-1"
                  />
                  <Button
                    size="sm"
                    className="rounded-xl"
                    onClick={() => {
                      if (counterAmount) {
                        onRespondToOffer(offer.id, 'accepted', parseFloat(counterAmount));
                        setShowCounter(false);
                        setCounterAmount('');
                      }
                    }}
                  >
                    Enviar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl"
                    onClick={() => setShowCounter(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="rounded-xl flex-1"
                    onClick={() => onRespondToOffer(offer.id, 'accepted')}
                  >
                    <Check className="mr-1 h-4 w-4" />
                    Aceitar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl flex-1"
                    onClick={() => setShowCounter(true)}
                  >
                    <Tag className="mr-1 h-4 w-4" />
                    Contra
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="rounded-xl"
                    onClick={() => onRespondToOffer(offer.id, 'rejected')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div className={cn(
        'max-w-[75%] rounded-2xl px-4 py-2',
        isOwn ? 'bg-primary text-primary-foreground' : 'bg-card border'
      )}>
        {message.media_url && (
          <img src={message.media_url} alt="" className="rounded-lg mb-2 max-w-full" />
        )}
        <p className="text-sm">{message.content}</p>
        <div className={cn(
          'flex items-center justify-end gap-1 mt-1',
          isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'
        )}>
          <span className="text-[10px]">
            {format(new Date(message.created_at), 'HH:mm')}
          </span>
          {isOwn && (
            message.is_read ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
