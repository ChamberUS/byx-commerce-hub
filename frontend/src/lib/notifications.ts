import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  body: string,
  href?: string,
  metadata?: Record<string, Json>
) {
  const { error } = await supabase.from('notifications').insert([{
    user_id: userId,
    type,
    title,
    body,
    href: href || null,
    metadata: (metadata || {}) as Json,
  }]);
  if (error) console.error('Failed to create notification:', error);
}
