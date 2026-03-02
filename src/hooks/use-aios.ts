import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AiosBalance {
  id: string;
  store_id: string;
  balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}

export interface AiosTransaction {
  id: string;
  store_id: string;
  order_id: string | null;
  type: string;
  amount: number;
  description: string | null;
  created_at: string;
}

export function useAiosBalance(storeId: string) {
  return useQuery({
    queryKey: ['aios-balance', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aios_balances')
        .select('*')
        .eq('store_id', storeId)
        .maybeSingle();

      if (error) throw error;
      return data as AiosBalance | null;
    },
    enabled: !!storeId,
  });
}

export function useAiosTransactions(storeId: string, limit = 10) {
  return useQuery({
    queryKey: ['aios-transactions', storeId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aios_transactions')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as AiosTransaction[];
    },
    enabled: !!storeId,
  });
}
