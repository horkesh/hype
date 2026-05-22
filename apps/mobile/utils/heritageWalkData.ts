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
  const { data, error } = await supabase
    .from('heritage_walks')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (error) { console.error('loadHeritageWalks error:', error); return []; }
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
  if (walkRes.error) { console.error('loadHeritageWalkDetail walk error:', walkRes.error); }
  if (stopsRes.error) { console.error('loadHeritageWalkDetail stops error:', stopsRes.error); }
  return {
    walk: walkRes.error ? null : (walkRes.data as HeritageWalk) ?? null,
    stops: stopsRes.error ? [] : (stopsRes.data ?? []) as HeritageWalkStop[],
  };
}
