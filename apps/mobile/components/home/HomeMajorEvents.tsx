import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { HomeMajorSeries, loadHomeMajorSeries } from '@/utils/homeData';

const CATEGORY_EMOJI: Record<string, string> = {
  market: '🍔', festival: '🎪', music: '🎶', film: '🎬', sport: '⚽',
  nightlife: '🎉', culture: '🎭', art: '🖼️', food: '🍽️',
};

/**
 * Card background: the festival's cover photo behind a dark scrim so white text
 * stays legible, falling back to the brand accent gradient when there's no photo.
 */
function CardBackground({
  imageUrl,
  accent,
  background,
}: {
  imageUrl: string | null;
  accent: string;
  background: string;
}): React.ReactElement {
  if (imageUrl) {
    return (
      <>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={200}
          cachePolicy="disk"
          recyclingKey={imageUrl}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.15)', 'rgba(0,0,0,0.65)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </>
    );
  }
  return (
    <LinearGradient
      colors={[accent, background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

/** Day-window countdown label from the series' start/end dates (Sarajevo). */
function countdownLabel(startDate: string, endDate: string, lang: string): string {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Sarajevo' });
  const day = 86_400_000;
  const toUTC = (d: string) => Date.parse(d + 'T00:00:00Z');
  if (today >= startDate && today <= endDate) return lang === 'bs' ? 'Traje sad' : 'Happening now';
  const diff = Math.round((toUTC(startDate) - toUTC(today)) / day);
  if (diff <= 0) return lang === 'bs' ? 'Uskoro' : 'Soon';
  if (diff === 1) return lang === 'bs' ? 'Sutra' : 'Tomorrow';
  if (diff <= 7) return lang === 'bs' ? `Za ${diff} dana` : `In ${diff} days`;
  return lang === 'bs' ? 'Uskoro' : 'Coming soon';
}

interface HomeMajorEventsProps {
  language: string;
}

export function HomeMajorEvents({ language }: HomeMajorEventsProps): React.ReactElement | null {
  const { colors } = useTheme();
  const router = useRouter();
  const [series, setSeries] = useState<HomeMajorSeries[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    loadHomeMajorSeries()
      .then((rows) => { if (mounted) { setSeries(rows); setLoaded(true); } })
      .catch(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);

  if (!loaded || series.length === 0) return null;

  const [spotlight, ...rest] = series;
  const areaOf = (s: HomeMajorSeries) => (language === 'bs' ? s.venue_area_bs : s.venue_area_en) ?? '';
  const nameOf = (s: HomeMajorSeries) => (language === 'bs' ? s.name_bs : s.name_en) || s.name_bs;
  const go = (id: string) => router.push(`/series/${id}`);

  return (
    <View>
      <Text style={[styles.header, { color: colors.text }]}>
        {language === 'bs' ? 'Veliki događaji' : 'Major events'}
      </Text>

      {/* Spotlight — the single biggest upcoming festival */}
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => go(spotlight.id)}
        style={styles.spotlight}
        accessibilityRole="button"
        accessibilityLabel={nameOf(spotlight)}
      >
        <CardBackground
          imageUrl={spotlight.cover_image_url}
          accent={colors.accent}
          background={colors.background}
        />
        <View style={styles.spotlightTop}>
          <Text style={styles.emoji}>{CATEGORY_EMOJI[spotlight.category] ?? '✨'}</Text>
          <View style={[styles.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
            <Text style={styles.badgeText}>{countdownLabel(spotlight.start_date, spotlight.end_date, language)}</Text>
          </View>
        </View>
        <View>
          <Text style={styles.spotlightName}>{nameOf(spotlight)}</Text>
          {!!areaOf(spotlight) && <Text style={styles.spotlightArea}>📍 {areaOf(spotlight)}</Text>}
          <Text style={styles.cta}>{language === 'bs' ? 'Pogledaj program ›' : 'See full programme ›'}</Text>
        </View>
      </TouchableOpacity>

      {/* Rail — the rest */}
      {rest.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {rest.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.9}
              onPress={() => go(s.id)}
              style={styles.railCard}
              accessibilityRole="button"
              accessibilityLabel={nameOf(s)}
            >
              <CardBackground
                imageUrl={s.cover_image_url}
                accent={colors.accent}
                background={colors.background}
              />
              <Text style={styles.emoji}>{CATEGORY_EMOJI[s.category] ?? '✨'}</Text>
              <Text style={styles.railName} numberOfLines={2}>{nameOf(s)}</Text>
              <Text style={styles.railCountdown}>{countdownLabel(s.start_date, s.end_date, language)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  spotlight: {
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    padding: 18,
    minHeight: 170,
    justifyContent: 'space-between',
  },
  spotlightTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emoji: { fontSize: 30 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { color: '#FFF', fontSize: 12, fontFamily: 'DMSans_700Bold', fontWeight: '700' },
  // Soft shadow keeps white labels legible over any cover photo, bright or dark.
  spotlightName: {
    color: '#FFF',
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 28,
    marginTop: 16,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  spotlightArea: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  cta: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    marginTop: 12,
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  rail: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  railCard: {
    width: 160,
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 14,
    justifyContent: 'space-between',
  },
  railName: {
    color: '#FFF',
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 15,
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  railCountdown: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontFamily: 'DMSans_500Medium',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
});
