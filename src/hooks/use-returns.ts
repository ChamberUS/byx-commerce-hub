import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Return {
  id: string;
  order_id: string;
  buyer_id: string;
  store_id: string;
  reason: string;
  details: string | null;
  status: 'requested' | 'approved' | 'label_generated' | 'in_transit' | 'received' | 'refunded' | 'rejected';
  return_tracking_code: string | null;
  return_label_url: string | null;
  created_at: string;
  updated_at: string;
  order?: {
    id: string;
    order_number: string;
    total: number;
    buyer_id: string;
  };
  buyer_profile?: {
    id: string;
    nome: string | null;
    email: string | null;
  };
}

export const returnReasons = [
  { value: 'danificado', label: 'Produto danificado' },
  { value: 'item_errado', label: 'Item errado enviado' },
  { value: 'nao_conforme', label: 'Não conforme com o anúncio' },
  { value: 'arrependimento', label: 'Arrependimento' },
  { value: 'outro', label: 'Outro motivo' },
];

export function useOrderReturns(orderId: string) {
  return useQuery({
    queryKey: ['returns', 'order', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Return[];
    },
    enabled: !!orderId,
  });
}

export function useStoreReturns(storeId: string) {
  return useQuery({
    queryKey: ['returns', 'store', storeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('returns')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
      if (error) throw error;

      // Fetch order info
      const orderIds = [...new Set(data.map(r => r.order_id))];
      const { data: orders } = await supabase
        .from('orders')
        .select('id, order_number, total, buyer_id')
        .in('id', orderIds);

      const buyerIds = [...new Set(orders?.map(o => o.buyer_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .in('id', buyerIds);

      return data.map(r => ({
        ...r,
        order: orders?.find(o => o.id === r.order_id),
        buyer_profile: profiles?.find(p => p.id === r.buyer_id),
      })) as Return[];
    },
    enabled: !!storeId,
  });
}

export function useCreateReturn() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      order_id: string;
      store_id: string;
      reason: string;
      details?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { data: ret, error } = await supabase
        .from('returns')
        .insert({
          order_id: data.order_id,
          buyer_id: user.id,
          store_id: data.store_id,
          reason: data.reason,
          details: data.details || null,
          status: 'requested',
        })
        .select()
        .single();
      if (error) throw error;
      return ret as Return;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['returns', 'order', variables.order_id] });
      queryClient.invalidateQueries({ queryKey: ['returns', 'store'] });
    },
  });
}

export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      returnId: string;
      status: Return['status'];
      return_tracking_code?: string;
      return_label_url?: string;
    }) => {
      const updateData: Record<string, unknown> = { status: data.status, updated_at: new Date().toISOString() };
      if (data.return_tracking_code) updateData.return_tracking_code = data.return_tracking_code;
      if (data.return_label_url) updateData.return_label_url = data.return_label_url;

      const { data: ret, error } = await supabase
        .from('returns')
        .update(updateData)
        .eq('id', data.returnId)
        .select()
        .single();
      if (error) throw error;
      return ret as Return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      queryClient.invalidateQueries({ queryKey: ['buyer-orders'] });
      queryClient.invalidateQueries({ queryKey: ['store-orders'] });
    },
  });
}
