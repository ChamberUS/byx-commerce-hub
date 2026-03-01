import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  city: string | null;
  state: string | null;
  instagram: string | null;
  whatsapp: string | null;
  website: string | null;
  rating_avg: number;
  rating_count: number;
  total_sales: number;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useMyStore() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['my-store', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Store | null;
    },
    enabled: !!user?.id,
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ['store', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      
      if (error) throw error;
      return data as Store | null;
    },
    enabled: !!slug,
  });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; description?: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: store, error } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return store as Store;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
    },
  });
}

export function useUpdateStore() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Store> & { id: string }) => {
      const { data: store, error } = await supabase
        .from('stores')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return store as Store;
    },
    onSuccess: (store) => {
      queryClient.invalidateQueries({ queryKey: ['my-store'] });
      queryClient.invalidateQueries({ queryKey: ['store', store.slug] });
    },
  });
}
