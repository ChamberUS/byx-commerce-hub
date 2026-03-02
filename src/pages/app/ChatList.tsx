import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Search } from 'lucide-react';
import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyStateCard } from '@/components/common/EmptyStateCard';
import { useConversations } from '@/hooks/use-chat';
import { useAuth } from '@/contexts/AuthContext';
import { useMyStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ChatList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: myStore } = useMyStore();
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: buyerConversations, isLoading: loadingBuyer } = useConversations('buyer');
  const { data: sellerConversations, isLoading: loadingSeller } = useConversations('seller', myStore?.id);

  const conversations = activeTab === 'buyer' ? buyerConversations : sellerConversations;
  const isLoading = activeTab === 'buyer' ? loadingBuyer : loadingSeller;

  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      conv.store?.name.toLowerCase().includes(query) ||
      conv.product?.title.toLowerCase().includes(query) ||
      conv.buyer_profile?.nome?.toLowerCase().includes(query)
    );
  });

  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
  };

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
      <header className="sticky top-0 bg-background/95 backdrop-blur-lg z-40 border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl" asChild>
              <Link to="/app"><ArrowLeft className="h-5 w-5" /></Link>
            </Button>
            <h1 className="text-lg font-semibold">Mensagens</h1>
          </div>
        </div>

        {/* Tabs for buyer/seller */}
        {myStore && (
          <div className="flex gap-2 px-4 pb-3">
            <Button
              variant={activeTab === 'buyer' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl"
              onClick={() => setActiveTab('buyer')}
            >
              Minhas Compras
            </Button>
            <Button
              variant={activeTab === 'seller' ? 'default' : 'outline'}
              size="sm"
              className="rounded-xl"
              onClick={() => setActiveTab('seller')}
            >
              Minha Loja
            </Button>
          </div>
        )}

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl"
            />
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {!filteredConversations || filteredConversations.length === 0 ? (
          <div className="px-4 py-8">
            <EmptyStateCard
              icon={MessageCircle}
              title="Nenhuma conversa"
              description={activeTab === 'buyer' 
                ? "Quando você entrar em contato com um vendedor, suas conversas aparecerão aqui."
                : "Quando clientes entrarem em contato, as conversas aparecerão aqui."
              }
              actionLabel="Explorar Produtos"
              actionHref="/app/search"
            />
          </div>
        ) : (
          <div className="divide-y">
            {filteredConversations.map((conv) => {
              const unreadCount = activeTab === 'buyer' ? conv.buyer_unread_count : conv.store_unread_count;
              const displayName = activeTab === 'buyer' 
                ? conv.store?.name 
                : conv.buyer_profile?.nome || 'Cliente';
              const avatarUrl = activeTab === 'buyer'
                ? conv.store?.logo_url
                : conv.buyer_profile?.avatar_url;
              const productImage = conv.product?.product_media?.[0]?.url;

              return (
                <Link
                  key={conv.id}
                  to={`/app/chat/${conv.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatarUrl || undefined} />
                      <AvatarFallback>{displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    {unreadCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "font-medium truncate",
                        unreadCount > 0 && "font-semibold"
                      )}>
                        {displayName}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.product && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.product.title}
                      </p>
                    )}
                  </div>

                  {productImage && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={productImage} alt="" className="w-full h-full object-cover" />
                    </div>
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
