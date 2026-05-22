'use client';

import Link from 'next/link';
import { VenueCard, type VenueCardInput } from '@look/ui';

export function VenueListView({ venues }: { venues: VenueCardInput[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {venues.map((v) => (
        <Link key={v.slug} href={`/lokacija/${v.slug}`} style={{ textDecoration: 'none' }}>
          <VenueCard venue={v} />
        </Link>
      ))}
    </div>
  );
}
