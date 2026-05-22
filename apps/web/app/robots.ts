import type { MetadataRoute } from 'next';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://look-app.com';

export default function robots(): MetadataRoute.Robots {
  // Preview deployments are noindex'd via x-robots-tag header in middleware.ts.
  // robots.txt itself is identical across envs — Google reads both.
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
