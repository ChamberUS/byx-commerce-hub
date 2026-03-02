import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface LegalDocument {
  id: string;
  type: 'terms' | 'privacy';
  title: string;
  content: string;
  version: string;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
}

export interface LegalAcceptance {
  id: string;
  user_id: string;
  document_id: string;
  accepted_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

export function useActiveLegalDocument(type: 'terms' | 'privacy') {
  return useQuery({
    queryKey: ['legal-document', type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('legal_documents')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      return data as LegalDocument | null;
    },
  });
}

export function useUserAcceptances() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-acceptances', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('legal_acceptances')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as LegalAcceptance[];
    },
    enabled: !!user?.id,
  });
}

export function useHasAcceptedDocument(documentId: string) {
  const { data: acceptances } = useUserAcceptances();
  
  return acceptances?.some(a => a.document_id === documentId) ?? false;
}

export function useAcceptLegalDocument() {
  const queryClient = useQueryClient();
  const { user, updateProfile } = useAuth();

  return useMutation({
    mutationFn: async (documentId: string) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('legal_acceptances')
        .insert({
          user_id: user.id,
          document_id: documentId,
          ip_address: null,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) throw error;

      // Update profile
      await updateProfile({
        termos_aceitos_em: new Date().toISOString(),
        onboarding_completo: true,
      });

      return data as LegalAcceptance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-acceptances'] });
    },
  });
}
