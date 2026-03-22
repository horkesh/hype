import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { GlassBadge } from '@/components/glass/GlassBadge';

interface EventDetailHeroProps {
  imageSource: string | null;
  title: string;
  formattedDateTime: string;
  colors: {
    text: string;
    textSecondary: string;
  };
}

export function EventDetailHero({
  imageSource,
  title,
  formattedDateTime,
  colors,
}: EventDetailHeroProps) {
  return (
    <>
      <ImageWithPlaceholder
        source={imageSource}
        style={styles.coverImage}
        borderRadius={0}
        categoryEmoji={'\ud83d\udcc5'}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.dateBadgeRow}>
          <GlassBadge label={formattedDateTime} variant="default" size="md" />
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'DMSerifDisplay_400Regular',
    marginBottom: 16,
  },
  dateBadgeRow: {
    flexDirection: 'row',
  },
});
