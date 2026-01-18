import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send, Image, Zap } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useConversations, Conversation } from '@/hooks/use-chat';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStore } from '@/hooks/use-store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export default function ChatList() {
  const { user } = useAuth();
  const { data: store } = useMyStore();
  const [view, setView] = useState<'buyer' | 'seller'>('buyer');
  
  const { data: conversations, isLoading } = useConversations(
    view, 
    view === 'seller' ? store?.id : undefined
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" asChild className="rounded-xl">
            <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <h1 className="text-lg font-semibold">Conversas</h1>
        </div>
        {store && (
          <div className="flex gap-2 px-4 pb-3">
            <Button 
              variant={view === 'buyer' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => setView('buyer')}
            >
              Compras
            </Button>
            <Button 
              variant={view === 'seller' ? 'default' : 'outline'} 
              size="sm" 
              className="rounded-full"
              onClick={() => setView('seller')}
            >
              Vendas
            </Button>
          </div>
        )}
      </header>

      <div className="max-w-2xl mx-auto px-4 py-4">
        {!conversations || conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhuma conversa</h2>
            <p className="text-muted-foreground">Suas conversas aparecerão aqui</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherParty = view === 'buyer' ? conv.store : conv.buyer_profile;
              const unreadCount = view === 'buyer' ? conv.buyer_unread_count : conv.store_unread_count;
              
              return (
                <Link
                  key={conv.id}
                  to={`/app/chat/${conv.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={(view === 'buyer' ? conv.store?.logo_url : conv.buyer_profile?.avatar_url) || undefined} />
                    <AvatarFallback>
                      {(view === 'buyer' ? conv.store?.name?.[0] : conv.buyer_profile?.nome?.[0]) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">
                        {view === 'buyer' ? conv.store?.name : conv.buyer_profile?.nome || 'Cliente'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: ptBR })}
                      </span>
                    </div>
                    {conv.product && (
                      <p className="text-sm text-muted-foreground truncate">
                        📦 {conv.product.title}
                      </p>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <span className="w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
