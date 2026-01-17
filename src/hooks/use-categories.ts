import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Sector {
  id: string;
  name: string;
  slug: string;
  emoji: string | null;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface Category {
  id: string;
  sector_id: string | null;
  parent_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CategoryAttribute {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  input_type: string;
  options: string[] | null;
  is_required: boolean;
  is_filterable: boolean;
  sort_order: number;
}

export function useSectors() {
  return useQuery({
    queryKey: ['sectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sectors')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as Sector[];
    },
  });
}

export function useCategories(sectorId?: string) {
  return useQuery({
    queryKey: ['categories', sectorId],
    queryFn: async () => {
      let query = supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (sectorId) {
        query = query.eq('sector_id', sectorId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCategoryAttributes(categoryId: string) {
  return useQuery({
    queryKey: ['category-attributes', categoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('category_attributes')
        .select('*')
        .eq('category_id', categoryId)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as CategoryAttribute[];
    },
    enabled: !!categoryId,
  });
}
