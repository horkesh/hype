import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { HypeHeader } from '@/components/HypeHeader';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { designTokens } from '@/styles/designTokens';

type SubKey = 'all' | 'beauty' | 'hair' | 'spa' | 'fitness' | 'yoga' | 'aesthetic';

interface WellnessVenue {
  id: string;
  name: string;
  neighborhood: string | null;
  cover_image_url: string | null;
  google_rating: number | null;
  google_ratings_count: number | null;
  tags: string[] | null;
}

// Each subcategory maps to a set of Google place_types + custom tags written
// by the discovery script. Match if the venue's tags contain any of these.
const SUB_TAGS: Record<Exclude<SubKey, 'all'>, string[]> = {
  beauty:    ['beauty_salon', 'nails'],
  hair:      ['hair_salon', 'hair_care'],
  spa:       ['spa', 'massage'],
  fitness:   ['fitness', 'gym'],
  yoga:      ['yoga', 'pilates'],
  aesthetic: ['aesthetic'],
};

const SUB_LABELS_BS: Record<SubKey, string> = {
  all:       'Sve',
  beauty:    'Saloni ljepote',
  hair:      'Frizeri',
  spa:       'Spa & masaža',
  fitness:   'Fitness',
  yoga:      'Yoga & pilates',
  aesthetic: 'Estetska klinika',
};

const SUB_LABELS_EN: Record<SubKey, string> = {
  all:       'All',
  beauty:    'Beauty',
  hair:      'Hair',
  spa:       'Spa & massage',
  fitness:   'Fitness',
  yoga:      'Yoga & pilates',
  aesthetic: 'Aesthetic',
};

function tagBadge(t: string, language: 'bs' | 'en'): string {
  const map: Record<string, { bs: string; en: string }> = {
    beauty_salon: { bs: 'Beauty', en: 'Beauty' },
    hair_salon:   { bs: 'Frizer', en: 'Hair' },
    hair_care:    { bs: 'Frizer', en: 'Hair' },
    nails:        { bs: 'Nokti',  en: 'Nails' },
    spa:          { bs: 'Spa',    en: 'Spa' },
    massage:      { bs: 'Masaža', en: 'Massage' },
    fitness:      { bs: 'Fitness',en: 'Fitness' },
    gym:          { bs: 'Fitness',en: 'Fitness' },
    yoga:         { bs: 'Yoga',   en: 'Yoga' },
    pilates:      { bs: 'Pilates',en: 'Pilates' },
    aesthetic:    { bs: 'Estetska',en: 'Aesthetic' },
  };
  return map[t]?.[language] ?? t;
}

export default function WellnessScreen() {
  const router = useRouter();
  const { language } = useApp();
  const { colors } = useTheme();
  const lang = (language === 'en' ? 'en' : 'bs') as 'bs' | 'en';

  const [venues, setVenues] = useState<WellnessVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [active, setActive] = useState<SubKey>('all');

  const load = async () => {
    const { data } = await supabase
      .from('venues')
      .select('id, name, neighborhood, cover_image_url, google_rating, google_ratings_count, tags')
      .eq('category', 'wellness')
      .eq('is_active', true)
      .order('google_rating', { ascending: false, nullsFirst: false });
    setVenues((data ?? []) as WellnessVenue[]);
  };

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    load().finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (active === 'all') return venues;
    const want = new Set(SUB_TAGS[active]);
    return venues.filter((v) => (v.tags ?? []).some((t) => want.has(t)));
  }, [venues, active]);

  const labels = lang === 'en' ? SUB_LABELS_EN : SUB_LABELS_BS;
  const subKeys: SubKey[] = ['all', 'beauty', 'hair', 'spa', 'fitness', 'yoga', 'aesthetic'];

  const content = (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={lang === 'en' ? 'Back' : 'Nazad'}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>
            {lang === 'en' ? 'Wellness in Sarajevo' : 'Wellness u Sarajevu'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {active === 'all'
              ? (lang === 'en' ? `${venues.length} venues` : `${venues.length} mjesta`)
              : (lang === 'en'
                  ? `${filtered.length} of ${venues.length} venues`
                  : `${filtered.length} od ${venues.length} mjesta`)}
          </Text>
        </View>
      </View>

      {/* Chip row — horizontal FlatList matches the proven HomeHiddenGems
          pattern. Plain View + flexWrap was disappearing on web because the
          FlatList sibling below was claiming flex space and collapsing it. */}
      <View style={styles.chipsContainer}>
        <FlatList
          horizontal
          data={subKeys}
          keyExtractor={(k) => k}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsListContent}
          renderItem={({ item: k }) => {
            const isActive = active === k;
            return (
              <TouchableOpacity
                onPress={() => setActive(k)}
                style={[
                  styles.chip,
                  isActive
                    ? { backgroundColor: colors.accent, borderColor: colors.accent }
                    : { backgroundColor: 'transparent', borderColor: colors.border ?? 'rgba(255,255,255,0.2)' },
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[
                  styles.chipText,
                  { color: isActive ? '#000' : colors.text },
                ]}>
                  {labels[k]}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            {lang === 'en' ? 'Loading...' : 'Učitavanje...'}
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Text style={{ color: colors.textSecondary }}>
            {lang === 'en' ? 'No venues in this category.' : 'Nema mjesta u ovoj kategoriji.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          renderItem={({ item }) => (
            <WellnessCard
              venue={item}
              language={lang}
              cardColor={colors.card}
              textColor={colors.text}
              textSecondary={colors.textSecondary}
              onPress={() => router.push(`/venue/${item.id}`)}
            />
          )}
        />
      )}
    </View>
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, styles.iosContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        {content}
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      {content}
    </SafeAreaView>
  );
}

interface CardProps {
  venue: WellnessVenue;
  language: 'bs' | 'en';
  cardColor: string;
  textColor: string;
  textSecondary: string;
  onPress: () => void;
}

const WellnessCard = React.memo(function WellnessCard({
  venue, language, cardColor, textColor, textSecondary, onPress,
}: CardProps) {
  const topTags = (venue.tags ?? [])
    .filter((t) => t !== 'wellness')
    .slice(0, 2);
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: cardColor }]}
      accessibilityRole="button"
      accessibilityLabel={venue.name}
    >
      {venue.cover_image_url ? (
        <Image source={{ uri: venue.cover_image_url }} style={styles.cardImage} />
      ) : (
        <View style={[styles.cardImage, { backgroundColor: '#2E2440' }]} />
      )}
      <View style={styles.cardBody}>
        <Text style={[styles.cardTitle, { color: textColor }]} numberOfLines={2}>
          {venue.name}
        </Text>
        <View style={styles.cardMetaRow}>
          {venue.google_rating !== null && (
            <Text style={[styles.cardRating, { color: textColor }]}>
              ★ {venue.google_rating.toFixed(1)}
              {venue.google_ratings_count !== null && (
                <Text style={{ color: textSecondary, fontSize: 11 }}>
                  {' '}({venue.google_ratings_count})
                </Text>
              )}
            </Text>
          )}
          {venue.neighborhood && (
            <Text style={[styles.cardNeighborhood, { color: textSecondary }]} numberOfLines={1}>
              · {venue.neighborhood}
            </Text>
          )}
        </View>
        {topTags.length > 0 && (
          <View style={styles.tagRow}>
            {topTags.map((t) => (
              <Text key={t} style={styles.tagPill}>
                {tagBadge(t, language)}
              </Text>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  iosContainer: { paddingTop: 48 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  backBtn: { padding: 4 },
  title: {
    ...designTokens.typography.sectionHeader,
    fontSize: 22,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 2,
  },
  chipsContainer: {
    // Explicit fixed height so the sibling FlatList can't squeeze the
    // chip row out of layout on react-native-web. 52 = chip vertical
    // padding (14) + text (~18) + chip border (2) + container padding (~18).
    height: 52,
    flexShrink: 0,
  },
  chipsListContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(142,45,226,0.12)',
  },
  cardImage: {
    width: 110,
    height: 110,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    marginBottom: 2,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardRating: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  cardNeighborhood: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  tagPill: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 10,
    color: '#8E2DE2',
    backgroundColor: 'rgba(142,45,226,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: 'hidden',
  },
});
