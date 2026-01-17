import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useFavoriteProducts() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorite-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('favorites_products')
        .select(`
          id,
          product_id,
          created_at,
          product:products(
            id, title, slug, price, condition, status,
            store:stores(id, name, slug),
            product_media(id, url, is_primary)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useFavoriteStores() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['favorite-stores', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('favorites_stores')
        .select(`
          id,
          store_id,
          created_at,
          store:stores(id, name, slug, logo_url, rating_avg, city, state)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useIsProductFavorite(productId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['is-product-favorite', productId, user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      
      const { data, error } = await supabase
        .from('favorites_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!user?.id && !!productId,
  });
}

export function useToggleFavoriteProduct() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (productId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorites_products')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle();
      
      if (existing) {
        // Remove favorite
        const { error } = await supabase
          .from('favorites_products')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        // Add favorite
        const { error } = await supabase
          .from('favorites_products')
          .insert({ user_id: user.id, product_id: productId });
        
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: (_, productId) => {
      queryClient.invalidateQueries({ queryKey: ['favorite-products'] });
      queryClient.invalidateQueries({ queryKey: ['is-product-favorite', productId] });
    },
  });
}

export function useToggleFavoriteStore() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (storeId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data: existing } = await supabase
        .from('favorites_stores')
        .select('id')
        .eq('user_id', user.id)
        .eq('store_id', storeId)
        .maybeSingle();
      
      if (existing) {
        const { error } = await supabase
          .from('favorites_stores')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return { action: 'removed' as const };
      } else {
        const { error } = await supabase
          .from('favorites_stores')
          .insert({ user_id: user.id, store_id: storeId });
        
        if (error) throw error;
        return { action: 'added' as const };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-stores'] });
    },
  });
}
