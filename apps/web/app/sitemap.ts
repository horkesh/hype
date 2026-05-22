import type { MetadataRoute } from 'next';
import { listActiveVenueSlugs, listUpcomingEventSlugs } from '@look/shared';
import { getServerSupabase } from '@/lib/supabase-server';

// Dynamic sitemap rebuilt every 6h (revalidate). Lists:
//   - Home (BS + EN) and statically-known top-level routes
//   - Every active venue at /lokacija/<slug> + /en/venue/<slug>
//   - Every upcoming active event at /dogadjaj/<slug> + /en/event/<slug>
//
// Google reads sitemap-driven hreflang when the URLs are emitted with
// xhtml:link rel="alternate" entries. Next.js's MetadataRoute.Sitemap
// supports the `alternates.languages` field for this — see below.

export const revalidate = 21600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://look-app.com';

function venueUrls(slugs: { slug: string; updated_at?: string | null }[]): MetadataRoute.Sitemap {
  return slugs.map(({ slug, updated_at }) => ({
    url: `${SITE}/lokacija/${slug}`,
    lastModified: updated_at ? new Date(updated_at) : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
    alternates: {
      languages: {
        'bs-BA': `${SITE}/lokacija/${slug}`,
        en: `${SITE}/en/venue/${slug}`,
      },
    },
  }));
}

function eventUrls(slugs: { slug: string; updated_at?: string | null }[]): MetadataRoute.Sitemap {
  return slugs.map(({ slug, updated_at }) => ({
    url: `${SITE}/dogadjaj/${slug}`,
    lastModified: updated_at ? new Date(updated_at) : undefined,
    changeFrequency: 'daily' as const,
    priority: 0.9,
    alternates: {
      languages: {
        'bs-BA': `${SITE}/dogadjaj/${slug}`,
        en: `${SITE}/en/event/${slug}`,
      },
    },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await getServerSupabase();

  // Run both queries in parallel — sitemap rebuild should be quick.
  const [venues, events] = await Promise.all([
    listActiveVenueSlugs(supabase).catch(() => []),
    listUpcomingEventSlugs(supabase).catch(() => []),
  ]);

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${SITE}/`,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: { languages: { 'bs-BA': `${SITE}/`, en: `${SITE}/en` } },
    },
    {
      url: `${SITE}/lokacije`,
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { languages: { 'bs-BA': `${SITE}/lokacije`, en: `${SITE}/en/venues` } },
    },
    {
      url: `${SITE}/dogadjaji`,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: { languages: { 'bs-BA': `${SITE}/dogadjaji`, en: `${SITE}/en/events` } },
    },
  ];

  return [...staticUrls, ...venueUrls(venues), ...eventUrls(events)];
}
