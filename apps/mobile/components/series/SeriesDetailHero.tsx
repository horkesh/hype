import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { GlassBadge } from '@/components/glass/GlassBadge';

interface SeriesDetailHeroProps {
  imageSource: string | null;
  title: string;
  dateRange: string;
  category: string;
  categoryEmoji: string;
  countdownStatus: string;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
  };
}

export function SeriesDetailHero({
  imageSource,
  title,
  dateRange,
  category,
  categoryEmoji,
  countdownStatus,
  colors,
}: SeriesDetailHeroProps) {
  return (
    <>
      <ImageWithPlaceholder
        source={imageSource}
        style={styles.coverImage}
        borderRadius={0}
        categoryEmoji={'\ud83c\udfaa'}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>

        <Text style={[styles.dateRange, { color: colors.textSecondary }]}>{dateRange}</Text>

        <View style={styles.badgeRow}>
          <GlassBadge label={`${categoryEmoji} ${category}`} variant="default" size="md" />
          <GlassBadge label={countdownStatus} variant="warning" size="md" />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  coverImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  dateRange: {
    fontSize: 16,
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
