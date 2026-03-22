import { supabase } from '@/integrations/supabase/client';

export interface VisitSarajevoPost {
  id: string;
  image_url: string;
  caption: string | null;
  post_url: string;
  timestamp: string | null;
}

export async function loadVisitSarajevoPosts(limit = 10): Promise<VisitSarajevoPost[]> {
  const { data } = await supabase
    .from('visit_sarajevo_posts')
    .select('id, image_url, caption, post_url, timestamp')
    .order('timestamp', { ascending: false })
    .limit(limit);
  return (data ?? []) as VisitSarajevoPost[];
}
