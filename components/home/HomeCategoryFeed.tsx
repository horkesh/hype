import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SectionHeader } from '@/components/SectionHeader';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';

interface CategoryVenue {
  id: string;
  name: string;
  category: string;
  neighborhood: string | null;
  google_rating: number | null;
  cover_image_url: string | null;
  moods: string[] | null;
  description_bs: string | null;
  description_en: string | null;
}

interface HomeCategoryFeedProps {
  category: string;
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
  const [venues, setVenues] = useState<CategoryVenue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    (async () => {
      // Query venues for this category — also match related categories
      const categoryFilter = getCategoryGroup(category);
      const { data } = await supabase
        .from('venues')
        .select('id, name, category, neighborhood, google_rating, cover_image_url, moods, description_bs, description_en')
        .in('category', categoryFilter)
        .order('google_rating', { ascending: false, nullsFirst: false })
        .limit(40);

      if (!mounted) return;

      let sorted = data ?? [];

      // Mood boost: if a mood is selected, sort mood-tagged venues to top
      if (selectedMood && sorted.length > 0) {
        const withMood: CategoryVenue[] = [];
        const without: CategoryVenue[] = [];
        for (const v of sorted) {
          if (v.moods?.includes(selectedMood)) {
            withMood.push(v);
          } else {
            without.push(v);
          }
        }
        sorted = [...withMood, ...without];
      }

      setVenues(sorted);
      setLoading(false);
    })();

    return () => { mounted = false; };
  }, [category, selectedMood]);

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
            {selectedMood && venue.moods?.includes(selectedMood) && (
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

/**
 * Map a grid category to the DB categories it should match.
 * e.g. "theatre" matches both "theatre" and "cultural_center"
 */
function getCategoryGroup(category: string): string[] {
  switch (category) {
    case 'restaurant':
      return ['restaurant'];
    case 'bar':
      return ['bar', 'pub', 'hookah'];
    case 'cafe':
      return ['cafe', 'bakery', 'dessert', 'ice_cream'];
    case 'club':
      return ['club'];
    case 'theatre':
      return ['theatre', 'cultural_center'];
    case 'museum':
      return ['museum'];
    case 'gallery':
      return ['gallery'];
    case 'landmark':
      return ['landmark', 'park', 'outdoor'];
    case 'cinema':
      return ['cinema'];
    case 'concert_hall':
      return ['concert_hall'];
    default:
      return [category];
  }
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
