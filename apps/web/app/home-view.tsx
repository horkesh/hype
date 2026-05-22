'use client';

import Link from 'next/link';
import { EventCard, type EventCardInput, VenueCard, type VenueCardInput } from '@look/ui';

interface Props {
  venues: VenueCardInput[];
  events: EventCardInput[];
}

export function HomeView({ venues, events }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
      <section>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, color: '#F5F5F5', marginBottom: 16 }}>
          Predstojeći događaji
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {events.slice(0, 6).map((e) => (
            <Link
              key={e.slug ?? e.title}
              href={e.slug ? `/dogadjaj/${e.slug}` : '#'}
              style={{ textDecoration: 'none' }}
            >
              <EventCard event={e} />
            </Link>
          ))}
        </div>
        {events.length > 6 && (
          <Link href="/dogadjaji" style={{ color: '#D4A056', marginTop: 12, display: 'inline-block' }}>
            Vidi sve →
          </Link>
        )}
      </section>

      <section>
        <h2 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 28, color: '#F5F5F5', marginBottom: 16 }}>
          Mjesta za otkriti
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {venues.slice(0, 4).map((v) => (
            <Link key={v.slug} href={`/lokacija/${v.slug}`} style={{ textDecoration: 'none' }}>
              <VenueCard venue={v} />
            </Link>
          ))}
        </div>
        {venues.length > 4 && (
          <Link href="/lokacije" style={{ color: '#D4A056', marginTop: 12, display: 'inline-block' }}>
            Vidi sve →
          </Link>
        )}
      </section>
    </div>
  );
}
