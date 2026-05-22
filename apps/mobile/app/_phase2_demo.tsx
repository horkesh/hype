// Phase 2 mobile demo. Fetches the same venue the web /lokacija/[slug] route
// would render and pipes it into the IDENTICAL VenueDetailContent component.
// Visual goal: match the web render pixel-for-pixel modulo native vs web
// differences (scroll behavior, font rendering subpixels).
//
// To switch which venue is rendered, change DEMO_SLUG. A future iteration
// will pass slug via expo-router params, but for the proof of concept a
// hardcoded slug keeps the demo dead simple.

import * as React from 'react';
import { ScrollView, Text as RNText, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  getBrowserSupabase,
  getVenueBySlug,
  getVenueDescription,
  getVenueInsiderTip,
  type Venue,
} from '@look/shared';
import { VenueDetailContent } from '@look/ui';

const DEMO_SLUG = 'cinemas-sloga';

export default function Phase2Demo() {
  const params = useLocalSearchParams<{ slug?: string }>();
  const slug = params.slug || DEMO_SLUG;
  const [state, setState] = React.useState<
    { kind: 'loading' } | { kind: 'ok'; venue: Venue } | { kind: 'missing' } | { kind: 'error'; message: string }
  >({ kind: 'loading' });

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = getBrowserSupabase();
        const venue = await getVenueBySlug(supabase, slug);
        if (cancelled) return;
        if (!venue) setState({ kind: 'missing' });
        else setState({ kind: 'ok', venue });
      } catch (err: any) {
        if (cancelled) return;
        setState({ kind: 'error', message: err?.message ?? String(err) });
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (state.kind === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
        <RNText style={{ color: '#A1A1AA' }}>Loading {slug}…</RNText>
      </View>
    );
  }
  if (state.kind === 'missing') {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center' }}>
        <RNText style={{ color: '#F5F5F5', fontSize: 18, marginBottom: 8 }}>Venue not found</RNText>
        <RNText style={{ color: '#A1A1AA' }}>slug: {slug}</RNText>
      </View>
    );
  }
  if (state.kind === 'error') {
    return (
      <View style={{ flex: 1, backgroundColor: '#121212', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <RNText style={{ color: '#EF4444', fontSize: 18, marginBottom: 8 }}>Error</RNText>
        <RNText style={{ color: '#A1A1AA', textAlign: 'center' }}>{state.message}</RNText>
      </View>
    );
  }

  const { venue } = state;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#121212' }}>
      <VenueDetailContent
        venue={{
          name: venue.name,
          slug: venue.slug,
          category: venue.category,
          neighborhood: venue.neighborhood,
          address: venue.address,
          cover_image_url: venue.cover_image_url,
          description: getVenueDescription(venue, 'bs'),
          insider_tip: getVenueInsiderTip(venue, 'bs'),
          moods: venue.moods,
          google_rating: venue.google_rating,
          google_ratings_count: venue.google_ratings_count,
          price_level: venue.price_level,
          phone: venue.phone,
          website: venue.website,
          instagram_handle: venue.instagram_handle,
          is_hidden_gem: venue.is_hidden_gem,
        }}
        language="bs"
      />
    </ScrollView>
  );
}
