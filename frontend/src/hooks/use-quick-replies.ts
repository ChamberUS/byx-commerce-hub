import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface QuickReply {
  id: string;
  store_id: string;
  title: string;
  content: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useQuickReplies(storeId: string) {
  return useQuery({
    queryKey: ['quick-replies', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quick_replies')
        .select('*')
        .eq('store_id', storeId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as QuickReply[];
    },
    enabled: !!storeId,
  });
}

export function useCreateQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { storeId: string; title: string; content: string }) => {
      const { data: reply, error } = await supabase
        .from('quick_replies')
        .insert({
          store_id: data.storeId,
          title: data.title,
          content: data.content,
        })
        .select()
        .single();

      if (error) throw error;
      return reply as QuickReply;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies', variables.storeId] });
    },
  });
}

export function useUpdateQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; storeId: string; title: string; content: string }) => {
      const { data: reply, error } = await supabase
        .from('quick_replies')
        .update({
          title: data.title,
          content: data.content,
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) throw error;
      return reply as QuickReply;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies', variables.storeId] });
    },
  });
}

export function useDeleteQuickReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { id: string; storeId: string }) => {
      const { error } = await supabase
        .from('quick_replies')
        .delete()
        .eq('id', data.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['quick-replies', variables.storeId] });
    },
  });
}
