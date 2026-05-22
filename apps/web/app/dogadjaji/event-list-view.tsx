'use client';

import Link from 'next/link';
import { EventCard, type EventCardInput } from '@look/ui';

export function EventListView({ events }: { events: EventCardInput[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {events.map((e) => {
        const href = e.slug ? `/dogadjaj/${e.slug}` : '#';
        return (
          <Link key={e.slug ?? e.title} href={href} style={{ textDecoration: 'none' }}>
            <EventCard event={e} />
          </Link>
        );
      })}
    </div>
  );
}
