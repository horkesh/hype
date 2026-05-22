import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimatedCard } from '@/components/AnimatedCard';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SectionHeader } from '@/components/SectionHeader';
import { HomeVenue } from '@/utils/homeData';

interface HomeFeaturedCafeSectionProps {
  cafe: HomeVenue;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
  };
  title: string;
  description: string | null;
  isWeb: boolean;
  onPress: (venueId: string) => void;
}

export function HomeFeaturedCafeSection({
  cafe,
  colors,
  title,
  description,
  isWeb,
  onPress,
}: HomeFeaturedCafeSectionProps) {
  return (
    <>
      <SectionHeader title={title} />
      <AnimatedCard delay={isWeb ? 0 : 100}>
        <TouchableOpacity
          style={[styles.featuredCard, { backgroundColor: colors.card }]}
          onPress={() => onPress(cafe.id)}
          activeOpacity={0.8}
        >
          <ImageWithPlaceholder
            source={cafe.cover_image_url}
            style={styles.featuredImage}
            categoryEmoji={'\u2615'}
            borderRadius={0}
          />
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredTitle, { color: colors.text }]}>{cafe.name}</Text>
            {cafe.neighborhood ? (
              <Text style={[styles.featuredMeta, { color: colors.textSecondary }]}>
                {cafe.neighborhood}
              </Text>
            ) : null}
            {description ? (
              <Text
                style={[styles.featuredDescription, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {description}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    </>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredContent: {
    padding: 16,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'DMSans_700Bold',
  },
  featuredMeta: {
    fontSize: 14,
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
  },
  featuredDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'DMSans_400Regular',
  },
});
