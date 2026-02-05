 import { useState } from 'react';
 import { Link, useNavigate, useParams } from 'react-router-dom';
 import { 
   ArrowLeft, Search, MessageCircle, Package, MoreVertical,
   Send, Tag, Zap, Check, CheckCheck, Clock, X, Image
 } from 'lucide-react';
 import { format, formatDistanceToNow } from 'date-fns';
 import { ptBR } from 'date-fns/locale';
 import { AppLayout } from '@/components/layout/AppLayout';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
 import { Badge } from '@/components/ui/badge';
 import { Skeleton } from '@/components/ui/skeleton';
 import { ScrollArea } from '@/components/ui/scroll-area';
 import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { useConversations } from '@/hooks/use-chat';
 import { useAuth } from '@/contexts/AuthContext';
 import { useMyStore } from '@/hooks/use-store';
 import { cn } from '@/lib/utils';
 
 // Re-export as the new ChatList with Phoenix-style layout
 export default function ChatInbox() {
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
         <div className="h-[calc(100vh-4rem)] flex">
           <div className="w-full lg:w-96 border-r">
             <div className="p-4 space-y-4">
               {Array.from({ length: 5 }).map((_, i) => (
                 <Skeleton key={i} className="h-20 rounded-xl" />
               ))}
             </div>
           </div>
         </div>
       </AppLayout>
     );
   }
 
   return (
     <AppLayout>
       <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] flex bg-background">
         {/* Sidebar - Conversation List */}
         <div className="w-full lg:w-96 border-r flex flex-col">
           {/* Header */}
           <div className="p-4 border-b space-y-4">
             <div className="flex items-center justify-between">
               <h1 className="text-xl font-bold">Mensagens</h1>
             </div>
             
             {/* Search */}
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input
                 placeholder="Buscar conversas..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-10 h-10 rounded-xl"
               />
             </div>
             
             {/* Tabs */}
             {myStore && (
               <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'buyer' | 'seller')}>
                 <TabsList className="grid grid-cols-2 w-full">
                   <TabsTrigger value="buyer">Minhas Compras</TabsTrigger>
                   <TabsTrigger value="seller">Minha Loja</TabsTrigger>
                 </TabsList>
               </Tabs>
             )}
           </div>
 
           {/* Conversation List */}
           <ScrollArea className="flex-1">
             {!filteredConversations || filteredConversations.length === 0 ? (
               <div className="p-8 text-center">
                 <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                 <h3 className="font-medium mb-1">Nenhuma conversa</h3>
                 <p className="text-sm text-muted-foreground">
                   {activeTab === 'buyer' 
                     ? "Inicie uma conversa ao perguntar sobre um produto"
                     : "Conversas com clientes aparecerão aqui"}
                 </p>
               </div>
             ) : (
               <div className="divide-y">
                 {filteredConversations.map((conv) => {
                   const unreadCount = activeTab === 'buyer' ? conv.buyer_unread_count : conv.store_unread_count;
                   const displayName = activeTab === 'buyer' 
                     ? conv.store?.name 
                     : conv.buyer_profile?.nome || 'Cliente';
                   const productImage = conv.product?.product_media?.[0]?.url;
 
                   return (
                     <Link
                       key={conv.id}
                       to={`/app/chat/${conv.id}`}
                       className={cn(
                         "flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors",
                         unreadCount > 0 && "bg-primary/5"
                       )}
                     >
                       {/* Product Thumbnail - Phoenix style */}
                       <div className="relative w-12 h-12 rounded-xl bg-muted overflow-hidden flex-shrink-0">
                         {productImage ? (
                           <img src={productImage} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center">
                             <Package className="h-5 w-5 text-muted-foreground" />
                           </div>
                         )}
                         {unreadCount > 0 && (
                           <Badge 
                             className="absolute -top-1 -right-1 h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
                           >
                             {unreadCount}
                           </Badge>
                         )}
                       </div>
 
                       <div className="flex-1 min-w-0">
                         <div className="flex items-center justify-between mb-0.5">
                           <span className={cn(
                             "font-medium truncate text-sm",
                             unreadCount > 0 && "font-semibold"
                           )}>
                             {displayName}
                           </span>
                           <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                             {formatTime(conv.last_message_at)}
                           </span>
                         </div>
                         {conv.product && (
                           <p className="text-xs text-muted-foreground truncate">
                             {conv.product.title}
                           </p>
                         )}
                       </div>
                     </Link>
                   );
                 })}
               </div>
             )}
           </ScrollArea>
         </div>
 
         {/* Desktop: Empty State when no conversation selected */}
         <div className="hidden lg:flex flex-1 items-center justify-center bg-muted/30">
           <div className="text-center">
             <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
             <h3 className="font-medium text-lg mb-1">Suas mensagens</h3>
             <p className="text-sm text-muted-foreground max-w-sm">
               Selecione uma conversa para ver as mensagens ou inicie uma nova conversa ao perguntar sobre um produto.
             </p>
           </div>
         </div>
       </div>
     </AppLayout>
   );
 }