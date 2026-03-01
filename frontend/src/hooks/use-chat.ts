import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Conversation {
  id: string;
  store_id: string;
  buyer_id: string;
  product_id: string | null;
  last_message_at: string;
  buyer_unread_count: number;
  store_unread_count: number;
  is_archived_buyer: boolean;
  is_archived_store: boolean;
  created_at: string;
  store?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
  };
  product?: {
    id: string;
    title: string;
    slug: string;
    price: number;
    product_media?: { url: string }[];
  };
  buyer_profile?: {
    id: string;
    nome: string | null;
    avatar_url: string | null;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'offer' | 'system';
  content: string | null;
  media_url: string | null;
  offer_id: string | null;
  is_read: boolean;
  created_at: string;
  sender?: {
    id: string;
    nome: string | null;
    avatar_url: string | null;
  };
  offer?: {
    id: string;
    amount: number;
    status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'cancelled';
    counter_amount: number | null;
    message: string | null;
  };
}

export interface Offer {
  id: string;
  conversation_id: string;
  product_id: string;
  buyer_id: string;
  amount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'expired' | 'cancelled';
  counter_amount: number | null;
  message: string | null;
  responded_at: string | null;
  expires_at: string | null;
  created_at: string;
}

export function useConversations(role: 'buyer' | 'seller' = 'buyer', storeId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['conversations', role, storeId, user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      let query = supabase
        .from('conversations')
        .select(`
          *,
          store:stores(id, name, slug, logo_url),
          product:products(id, title, slug, price, product_media(url))
        `)
        .order('last_message_at', { ascending: false });
      
      if (role === 'buyer') {
        query = query.eq('buyer_id', user.id).eq('is_archived_buyer', false);
      } else if (storeId) {
        query = query.eq('store_id', storeId).eq('is_archived_store', false);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Fetch buyer profiles for seller view
      if (role === 'seller' && data) {
        const buyerIds = [...new Set(data.map(c => c.buyer_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, nome, avatar_url')
          .in('id', buyerIds);
        
        return data.map(conv => ({
          ...conv,
          buyer_profile: profiles?.find(p => p.id === conv.buyer_id),
        })) as Conversation[];
      }
      
      return data as Conversation[];
    },
    enabled: !!user?.id && (role === 'buyer' || !!storeId),
  });
}

export function useMessages(conversationId: string) {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      // Get sender profiles
      const senderIds = [...new Set(messages.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, avatar_url')
        .in('id', senderIds);
      
      // Get offers for offer messages
      const offerIds = messages.filter(m => m.offer_id).map(m => m.offer_id);
      let offers: Offer[] = [];
      if (offerIds.length > 0) {
        const { data: offersData } = await supabase
          .from('offers')
          .select('*')
          .in('id', offerIds);
        offers = offersData || [];
      }
      
      return messages.map(msg => ({
        ...msg,
        sender: profiles?.find(p => p.id === msg.sender_id),
        offer: offers.find(o => o.id === msg.offer_id),
      })) as Message[];
    },
    enabled: !!conversationId,
  });
  
  // Subscribe to realtime updates
  useEffect(() => {
    if (!conversationId) return;
    
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
  
  return query;
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      content?: string;
      messageType?: 'text' | 'image' | 'offer' | 'system';
      mediaUrl?: string;
      offerId?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: user.id,
          message_type: data.messageType || 'text',
          content: data.content || null,
          media_url: data.mediaUrl || null,
          offer_id: data.offerId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', data.conversationId);
      
      return message as Message;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { storeId: string; productId?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if conversation already exists
      let query = supabase
        .from('conversations')
        .select('*')
        .eq('store_id', data.storeId)
        .eq('buyer_id', user.id);
      
      if (data.productId) {
        query = query.eq('product_id', data.productId);
      }
      
      const { data: existing } = await query.maybeSingle();
      
      if (existing) {
        return existing as Conversation;
      }
      
      // Create new conversation
      const { data: conversation, error } = await supabase
        .from('conversations')
        .insert({
          store_id: data.storeId,
          buyer_id: user.id,
          product_id: data.productId || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return conversation as Conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useCreateOffer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      conversationId: string;
      productId: string;
      amount: number;
      message?: string;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Create offer
      const { data: offer, error: offerError } = await supabase
        .from('offers')
        .insert({
          conversation_id: data.conversationId,
          product_id: data.productId,
          buyer_id: user.id,
          amount: data.amount,
          message: data.message || null,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        })
        .select()
        .single();
      
      if (offerError) throw offerError;
      
      // Create offer message
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: user.id,
          message_type: 'offer',
          offer_id: offer.id,
          content: data.message || `Oferta de ${data.amount} BYX`,
        });
      
      // Update conversation
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', data.conversationId);
      
      return offer as Offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

export function useRespondToOffer() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: {
      offerId: string;
      conversationId: string;
      action: 'accept' | 'reject' | 'counter';
      counterAmount?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const updateData: Partial<Offer> = {
        status: data.action === 'counter' ? 'countered' : data.action === 'accept' ? 'accepted' : 'rejected',
        responded_at: new Date().toISOString(),
      };
      
      if (data.action === 'counter' && data.counterAmount) {
        updateData.counter_amount = data.counterAmount;
      }
      
      const { data: offer, error } = await supabase
        .from('offers')
        .update(updateData)
        .eq('id', data.offerId)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create system message
      let messageContent = '';
      if (data.action === 'accept') {
        messageContent = 'Oferta aceita! 🎉';
      } else if (data.action === 'reject') {
        messageContent = 'Oferta recusada.';
      } else {
        messageContent = `Contra-oferta: ${data.counterAmount} BYX`;
      }
      
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: user.id,
          message_type: 'system',
          content: messageContent,
        });
      
      return offer as Offer;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
