import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SectionHeader } from '@/components/SectionHeader';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { getCategoryGroup, getCategoryLabel } from '@/utils/categoryLabels';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import { moodToDbValue } from '@/utils/homeScreenContent';
import type { HomeCategoryId } from '@/components/home/HomeCategoryGrid';

interface CategoryVenue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  google_rating: number | null;
  cover_image_url: string | null;
  moods: string[] | null;
}

interface HomeCategoryFeedProps {
  category: HomeCategoryId;
  selectedMood: string | null;
  language: 'bs' | 'en';
}

export function HomeCategoryFeed({
  category,
  selectedMood,
  language,
}: HomeCategoryFeedProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [rawVenues, setRawVenues] = useState<CategoryVenue[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch only when category changes — mood is a client-side sort
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      const categoryFilter = getCategoryGroup(category);
      const { data } = await supabase
        .from('venues')
        .select('id, name, category, neighborhood, google_rating, cover_image_url, moods')
        .in('category', categoryFilter)
        .order('google_rating', { ascending: false, nullsFirst: false })
        .limit(40);

      if (!mounted) return;
      setRawVenues(data ?? []);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [category]);

  // Mood filter: when a mood is active, show ONLY venues with that mood tag
  const dbMood = selectedMood ? moodToDbValue(selectedMood) : null;
  const venues = useMemo(() => {
    if (!dbMood || rawVenues.length === 0) return rawVenues;
    return rawVenues.filter((v) => v.moods?.includes(dbMood));
  }, [rawVenues, dbMood]);

  const title = getCategoryLabel(category, language);
  const countLabel = loading
    ? (language === 'bs' ? 'Učitavanje...' : 'Loading...')
    : (language === 'bs' ? `${venues.length} mjesta` : `${venues.length} places`);

  return (
    <View>
      <SectionHeader
        title={title}
        subtitle={countLabel}
      />
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]} />
          ))}
        </View>
      ) : venues.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          {language === 'bs' ? 'Nema rezultata' : 'No results'}
        </Text>
      ) : (
        venues.map((venue) => (
          <TouchableOpacity
            key={venue.id}
            style={[styles.card, { backgroundColor: colors.card }]}
            activeOpacity={0.7}
            onPress={() => router.push(`/venue/${venue.id}`)}
          >
            <ImageWithPlaceholder
              source={venue.cover_image_url ? { uri: venue.cover_image_url } : undefined}
              style={styles.image}
            />
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {venue.name}
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                {getCategoryLabel(venue.category, language)}
                {venue.neighborhood ? ` · ${venue.neighborhood}` : ''}
              </Text>
              {venue.google_rating != null && venue.google_rating > 0 && (
                <Text style={[styles.rating, { color: colors.accent }]}>
                  ★ {venue.google_rating.toFixed(1)}
                </Text>
              )}
            </View>
            {dbMood && venue.moods?.includes(dbMood) && (
              <View style={styles.moodBadge}>
                <GlassBadge label="★" variant="accent" />
              </View>
            )}
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  loadingContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  skeletonCard: {
    height: 80,
    borderRadius: 16,
  },
  empty: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 10,
    gap: 12,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
  },
  meta: {
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
  },
  rating: {
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    marginTop: 2,
  },
  moodBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
});
