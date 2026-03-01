import { supabase } from '@/integrations/supabase/client';

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

    return { url: data.publicUrl, error: null };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: null, error: error as Error };
  }
}

export async function deleteFile(
  bucket: string,
  url: string
): Promise<{ error: Error | null }> {
  try {
    // Extract path from URL
    const bucketUrl = supabase.storage.from(bucket).getPublicUrl('').data.publicUrl;
    const path = url.replace(bucketUrl, '');

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Delete error:', error);
    return { error: error as Error };
  }
}
