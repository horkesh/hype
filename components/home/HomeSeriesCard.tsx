import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimatedCard } from '@/components/AnimatedCard';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { HomeEventSeries } from '@/utils/homeData';
import { HomeLanguage } from '@/utils/homeScreenContent';
import { getHomeSeriesCardContent } from '@/utils/homeEventsSection';

interface HomeSeriesCardProps {
  series: HomeEventSeries;
  index: number;
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
  };
  onPress: (seriesId: string) => void;
}

export function HomeSeriesCard({ series, index, language, colors, onPress }: HomeSeriesCardProps) {
  const content = getHomeSeriesCardContent(language, series);

  return (
    <AnimatedCard delay={Platform.OS === 'web' ? 0 : index * 50}>
      <TouchableOpacity
        style={[styles.card, styles.blockCard, { backgroundColor: colors.card }]}
        onPress={() => onPress(series.id)}
        activeOpacity={0.8}
      >
        <ImageWithPlaceholder
          source={series.cover_image_url}
          style={styles.image}
          categoryEmoji={'\ud83c\udfad'}
          borderRadius={0}
        />
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {content.title}
          </Text>
          <Text style={[styles.countdown, { color: colors.accent }]}>{content.countdownLabel}</Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  blockCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    width: 300,
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  countdown: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});
