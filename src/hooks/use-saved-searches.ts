import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface SavedSearch {
  id: string;
  user_id: string;
  name: string | null;
  query: string;
  filters: Record<string, unknown>;
  notify_new_results: boolean;
  last_notified_at: string | null;
  created_at: string;
}

export function useSavedSearches() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['saved-searches', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SavedSearch[];
    },
    enabled: !!user?.id,
  });
}

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { query: string; name?: string; filters?: Record<string, unknown> }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: search, error } = await supabase
        .from('saved_searches')
        .insert([{
          user_id: user.id,
          query: data.query,
          name: data.name || data.query,
          filters: (data.filters || {}) as unknown as import('@/integrations/supabase/types').Json,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return search as SavedSearch;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('saved_searches')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });
}
