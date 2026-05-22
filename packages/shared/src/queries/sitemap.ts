// Sitemap-only queries. Project the minimum fields needed so the sitemap
// route can ship thousands of URLs without dragging the full row payload
// over the network.

import { type SupabaseClient } from '@supabase/supabase-js';

export interface SitemapSlug {
  slug: string;
  updated_at?: string | null;
}

export async function listActiveVenueSlugs(supabase: SupabaseClient): Promise<SitemapSlug[]> {
  const { data, error } = await supabase
    .from('venues')
    .select('slug, updated_at')
    .eq('is_active', true)
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error) throw error;
  return ((data ?? []) as SitemapSlug[]).filter((v) => v.slug);
}

export async function listUpcomingEventSlugs(supabase: SupabaseClient): Promise<SitemapSlug[]> {
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('slug, updated_at:start_datetime')
    .eq('is_active', true)
    .eq('status', 'approved')
    .gte('start_datetime', nowIso)
    .not('slug', 'is', null)
    .order('start_datetime', { ascending: true })
    .limit(5000);
  if (error) throw error;
  return ((data ?? []) as SitemapSlug[]).filter((v) => v.slug);
}
