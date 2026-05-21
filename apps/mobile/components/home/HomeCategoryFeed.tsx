import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, ListRenderItemInfo, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

interface VenueCardProps {
  venue: CategoryVenue;
  cardColor: string;
  textColor: string;
  textSecondaryColor: string;
  accentColor: string;
  dbMood: string | null;
  language: 'bs' | 'en';
  onPress: (venueId: string) => void;
}

const HomeCategoryVenueCard = React.memo(function HomeCategoryVenueCard({
  venue,
  cardColor,
  textColor,
  textSecondaryColor,
  accentColor,
  dbMood,
  language,
  onPress,
}: VenueCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: cardColor }]}
      activeOpacity={0.7}
      onPress={() => onPress(venue.id)}
      accessibilityRole="button"
      accessibilityLabel={venue.name}
    >
      <ImageWithPlaceholder
        source={venue.cover_image_url ? { uri: venue.cover_image_url } : undefined}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
          {venue.name}
        </Text>
        <Text style={[styles.meta, { color: textSecondaryColor }]} numberOfLines={1}>
          {getCategoryLabel(venue.category, language)}
          {venue.neighborhood ? ` · ${venue.neighborhood}` : ''}
        </Text>
        {venue.google_rating != null && venue.google_rating > 0 && (
          <Text style={[styles.rating, { color: accentColor }]}>
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
  );
});

const keyExtractor = (item: CategoryVenue) => item.id;

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

  const handleVenuePress = useCallback(
    (venueId: string) => router.push(`/venue/${venueId}`),
    [router],
  );

  const renderItem = useCallback(
    ({ item: venue }: ListRenderItemInfo<CategoryVenue>) => (
      <HomeCategoryVenueCard
        venue={venue}
        cardColor={colors.card}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        accentColor={colors.accent}
        dbMood={dbMood}
        language={language}
        onPress={handleVenuePress}
      />
    ),
    [colors.card, colors.text, colors.textSecondary, colors.accent, dbMood, language, handleVenuePress],
  );

  const ListHeader = useMemo(
    () => <SectionHeader title={title} subtitle={countLabel} />,
    [title, countLabel],
  );

  const ListEmpty = useMemo(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: colors.card }]} />
          ))}
        </View>
      );
    }
    return (
      <Text style={[styles.empty, { color: colors.textSecondary }]}>
        {language === 'bs' ? 'Nema rezultata' : 'No results'}
      </Text>
    );
  }, [loading, colors.card, colors.textSecondary, language]);

  return (
    <FlatList
      data={loading ? [] : venues}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={ListEmpty}
      scrollEnabled={false}
    />
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
