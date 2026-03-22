import { supabase } from '@/integrations/supabase/client';

export interface HeritageWalk {
  id: string;
  slug: string;
  title_bs: string;
  title_en: string;
  description_bs: string | null;
  description_en: string | null;
  cover_image_url: string | null;
  estimated_minutes: number;
  distance_km: number;
  difficulty: string;
}

export interface HeritageWalkStop {
  id: string;
  sort_order: number;
  title_bs: string;
  title_en: string;
  description_bs: string | null;
  description_en: string | null;
  latitude: number | null;
  longitude: number | null;
  walking_minutes_to_next: number;
  what_to_look_for_bs: string | null;
  what_to_look_for_en: string | null;
  source_attribution: string | null;
  venue_id: string | null;
  venues?: { name: string; cover_image_url: string | null } | null;
}

export async function loadHeritageWalks(): Promise<HeritageWalk[]> {
  const { data } = await supabase
    .from('heritage_walks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as HeritageWalk[];
}

export async function loadHeritageWalkDetail(walkId: string): Promise<{
  walk: HeritageWalk | null;
  stops: HeritageWalkStop[];
}> {
  const [walkRes, stopsRes] = await Promise.all([
    supabase.from('heritage_walks').select('*').eq('id', walkId).maybeSingle(),
    supabase
      .from('heritage_walk_stops')
      .select('*, venues(name, cover_image_url)')
      .eq('walk_id', walkId)
      .order('sort_order', { ascending: true }),
  ]);
  return {
    walk: (walkRes.data as HeritageWalk) ?? null,
    stops: (stopsRes.data ?? []) as HeritageWalkStop[],
  };
}
