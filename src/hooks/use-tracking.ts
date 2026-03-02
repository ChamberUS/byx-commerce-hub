import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TrackingEvent {
  id: string;
  order_id: string;
  status_code: string;
  description: string;
  location: string | null;
  occurred_at: string;
  created_at: string;
}

export function useTrackingHistory(orderId: string) {
  return useQuery({
    queryKey: ['tracking-history', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tracking_history')
        .select('*')
        .eq('order_id', orderId)
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return data as TrackingEvent[];
    },
    enabled: !!orderId,
  });
}

export function useAddTrackingEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      order_id: string;
      status_code: string;
      description: string;
      location?: string;
      occurred_at?: string;
    }) => {
      const { data: event, error } = await supabase
        .from('tracking_history')
        .insert({
          order_id: data.order_id,
          status_code: data.status_code,
          description: data.description,
          location: data.location || null,
          occurred_at: data.occurred_at || new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return event as TrackingEvent;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tracking-history', variables.order_id] });
    },
  });
}
