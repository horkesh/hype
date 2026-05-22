'use client';

// Tamagui components require a client-side React context, so anything that
// renders @look/ui primitives must be in a 'use client' boundary. The page.tsx
// server component fetches the venue + emits metadata/JSON-LD, then hands
// the serialized data to this client component for rendering. The SEO crawl
// still sees fully-rendered HTML because Next.js streams the client-component
// markup into the initial response.

import { VenueDetailContent, type VenueDetailInput } from '@look/ui';

export function VenueView({ venue, language }: { venue: VenueDetailInput; language: 'bs' | 'en' }) {
  return <VenueDetailContent venue={venue} language={language} />;
}
