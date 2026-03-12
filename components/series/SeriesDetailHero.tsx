import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';

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

        <View style={[styles.categoryBadge, { backgroundColor: colors.card }]}>
          <Text style={styles.categoryEmoji}>{categoryEmoji}</Text>
          <Text style={[styles.categoryText, { color: colors.text }]}>{category}</Text>
        </View>

        <View style={[styles.countdownBadge, { backgroundColor: '#D4A056' }]}>
          <Text style={styles.countdownText}>{countdownStatus}</Text>
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
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  countdownBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  countdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
