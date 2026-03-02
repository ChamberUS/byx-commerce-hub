import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  store_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  price_brl_ref: number | null;
  listing_type: 'fixed_price' | 'accepts_offers' | 'auction';
  condition: 'new' | 'used' | 'refurbished';
  status: 'draft' | 'active' | 'paused' | 'sold' | 'deleted';
  allow_offers: boolean;
  min_offer_price: number | null;
  stock_quantity: number;
  sku: string | null;
  attributes: Record<string, string>;
  views_count: number;
  favorites_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  store?: {
    id: string;
    name: string;
    slug: string;
    logo_url: string | null;
    rating_avg: number;
    city: string | null;
    state: string | null;
  };
  product_media?: {
    id: string;
    url: string;
    alt_text: string | null;
    sort_order: number;
    is_primary: boolean;
  }[];
  category?: {
    id: string;
    name: string;
    slug: string;
    sector_id: string | null;
  };
}

export interface ProductFilters {
  query?: string;
  category_id?: string;
  sector_id?: string;
  min_price?: number;
  max_price?: number;
  condition?: string[];
  allow_offers?: boolean;
  sort_by?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
  limit?: number;
  offset?: number;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          store:stores(id, name, slug, logo_url, rating_avg, city, state),
          product_media(id, url, alt_text, sort_order, is_primary),
          category:categories(id, name, slug, sector_id)
        `)
        .eq('status', 'active');
      
      if (filters.query) {
        query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      }
      
      if (filters.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      
      if (filters.min_price !== undefined) {
        query = query.gte('price', filters.min_price);
      }
      
      if (filters.max_price !== undefined) {
        query = query.lte('price', filters.max_price);
      }
      
      if (filters.condition && filters.condition.length > 0) {
        query = query.in('condition', filters.condition as ('new' | 'used' | 'refurbished')[]);
      }
      
      if (filters.allow_offers !== undefined) {
        query = query.eq('allow_offers', filters.allow_offers);
      }
      
      // Sorting
      switch (filters.sort_by) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'rating':
          query = query.order('favorites_count', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          store:stores(id, name, slug, logo_url, rating_avg, rating_count, city, state, whatsapp, instagram),
          product_media(id, url, alt_text, sort_order, is_primary),
          category:categories(id, name, slug, sector_id)
        `)
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Increment view count
      if (data) {
        supabase
          .from('products')
          .update({ views_count: (data.views_count || 0) + 1 })
          .eq('id', id)
          .then();
      }
      
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useStoreProducts(storeId: string, status?: string) {
  return useQuery({
    queryKey: ['store-products', storeId, status],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          product_media(id, url, alt_text, sort_order, is_primary),
          category:categories(id, name, slug)
        `)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      
      if (status) {
        query = query.eq('status', status as 'draft' | 'active' | 'paused' | 'sold' | 'deleted');
      } else {
        query = query.neq('status', 'deleted' as const);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!storeId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Product> & { store_id: string; title: string; price: number; slug: string }) => {
      const { data: product, error } = await supabase
        .from('products')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return product as Product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['store-products', product.store_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Product> & { id: string }) => {
      const { data: product, error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return product as Product;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
      queryClient.invalidateQueries({ queryKey: ['store-products', product.store_id] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .update({ status: 'deleted' })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['store-products'] });
    },
  });
}
