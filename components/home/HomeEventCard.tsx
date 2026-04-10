import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimatedCard } from '@/components/AnimatedCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { useEventCountdown } from '@/hooks/useEventCountdown';
import { HomeEventItem } from '@/utils/homeData';
import { HomeLanguage } from '@/utils/homeScreenContent';
import { getHomeEventCardContent } from '@/utils/homeEventsSection';

interface HomeEventCardProps {
  event: HomeEventItem;
  index: number;
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  onPress: (eventId: string) => void;
}

export function HomeEventCard({ event, index, language, colors, onPress }: HomeEventCardProps) {
  const content = getHomeEventCardContent(language, event);
  const countdown = useEventCountdown(event.start_datetime, language);

  return (
    <AnimatedCard delay={Platform.OS === 'web' ? 0 : index * 50}>
      <TouchableOpacity
        style={[styles.card, styles.blockCard, { backgroundColor: colors.card }]}
        onPress={() => onPress(event.id)}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={content.title}
      >
        <View>
          <ImageWithPlaceholder
            source={event.cover_image_url}
            style={styles.image}
            categoryEmoji={'\ud83c\udf89'}
            borderRadius={0}
          />
          {countdown.label ? (
            <View style={styles.countdownOverlay}>
              <GlassBadge
                label={countdown.label}
                variant={countdown.isHappeningNow ? 'danger' : 'accent'}
                size="sm"
              />
            </View>
          ) : null}
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
            {content.title}
          </Text>
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{content.dateLabel}</Text>
          {content.venueName ? (
            <Text style={[styles.detailText, { color: colors.textSecondary }]}>{content.venueName}</Text>
          ) : null}
          <Text style={[styles.detailText, { color: colors.accent }]}>{content.priceLabel}</Text>
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
    width: 280,
    marginRight: 16,
  },
  image: {
    width: '100%',
    height: 160,
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
  detailText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'DMSans_400Regular',
  },
  countdownOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
  },
});
