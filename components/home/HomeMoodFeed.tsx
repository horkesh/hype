import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { AnimatedCard } from '@/components/AnimatedCard';
import { ContentState } from '@/components/ContentState';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SectionHeader } from '@/components/SectionHeader';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';
import type { MoodId } from '@/styles/glassTokens';
import { getHomeEventCardContent } from '@/utils/homeEventsSection';
import {
  HOME_MOODS,
  HomeLanguage,
} from '@/utils/homeScreenContent';
import {
  MoodFeedEvent,
  MoodFeedItem,
  MoodFeedVenue,
  loadMoodFeed,
} from '@/utils/homeMoodFeed';

interface HomeMoodFeedProps {
  moodId: string;
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  onEventPress: (eventId: string) => void;
}

function MoodFeedVenueCard({
  item,
  index,
  language,
  onPress,
}: {
  item: MoodFeedVenue;
  index: number;
  language: HomeLanguage;
  onPress: () => void;
}) {
  return (
    <AnimatedCard delay={Platform.OS === 'web' ? 0 : index * 50}>
      <FlippableCard
        height={240}
        style={styles.venueCard}
        onPress={onPress}
        front={
          <VenueCardFront
            name={item.name}
            imageUrl={item.cover_image_url ?? undefined}
            category={getCategoryLabel(item.category, language)}
            isHiddenGem={item.is_hidden_gem}
          />
        }
        back={
          <VenueCardBack
            name={item.name}
            address={item.address ?? undefined}
            description={
              language === 'bs'
                ? (item.description_bs ?? undefined)
                : (item.description_en ?? item.description_bs ?? undefined)
            }
          />
        }
      />
    </AnimatedCard>
  );
}

function MoodFeedEventCard({
  item,
  index,
  language,
  colors,
  onPress,
}: {
  item: MoodFeedEvent;
  index: number;
  language: HomeLanguage;
  colors: HomeMoodFeedProps['colors'];
  onPress: () => void;
}) {
  const content = getHomeEventCardContent(language, {
    id: item.id,
    title_bs: item.title_bs,
    title_en: item.title_en,
    cover_image_url: item.cover_image_url,
    start_datetime: item.start_datetime,
    moods: item.moods,
    price_bam: item.price_bam,
    location_name: item.location_name,
    venues: item.venues,
  });

  return (
    <AnimatedCard delay={Platform.OS === 'web' ? 0 : index * 50}>
      <TouchableOpacity
        style={[styles.eventCard, { backgroundColor: colors.card }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <ImageWithPlaceholder
          source={item.cover_image_url}
          style={styles.eventImage}
          categoryEmoji={'\ud83c\udf89'}
          borderRadius={0}
        />
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {content.title}
          </Text>
          <Text style={[styles.eventDetail, { color: colors.textSecondary }]}>
            {content.dateLabel}
          </Text>
          {content.venueName ? (
            <Text style={[styles.eventDetail, { color: colors.textSecondary }]}>
              {content.venueName}
            </Text>
          ) : null}
          <Text style={[styles.eventDetail, { color: colors.accent }]}>
            {content.priceLabel}
          </Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

export function HomeMoodFeed({
  moodId,
  language,
  colors,
  onEventPress,
}: HomeMoodFeedProps) {
  const router = useRouter();
  const [items, setItems] = useState<MoodFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const mood = HOME_MOODS.find((m) => m.id === moodId);
  const moodLabel = mood
    ? (language === 'bs' ? mood.label_bs : mood.label_en)
    : moodId;
  const moodColor = glassTokens.moodColors[moodId as MoodId]?.primary ?? colors.accent;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    loadMoodFeed(moodId)
      .then((feed) => {
        if (mounted) {
          setItems(feed);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setItems([]);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, [moodId]);

  const emptyMessage = language === 'bs'
    ? 'Nema rezultata za ovaj mood'
    : 'No spots match this mood yet';

  return (
    <View style={styles.container}>
      <SectionHeader title={moodLabel} />
      <View style={[styles.moodAccent, { backgroundColor: moodColor }]} />
      <ContentState
        loading={loading}
        empty={items.length === 0}
        emptyMessage={emptyMessage}
      >
        <View style={styles.feed}>
          {items.map((item, index) =>
            item.type === 'venue' ? (
              <MoodFeedVenueCard
                key={`v-${item.id}`}
                item={item}
                index={index}
                language={language}
                onPress={() => router.push(`/venue/${item.id}`)}
              />
            ) : (
              <MoodFeedEventCard
                key={`e-${item.id}`}
                item={item}
                index={index}
                language={language}
                colors={colors}
                onPress={() => onEventPress(item.id)}
              />
            ),
          )}
        </View>
      </ContentState>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  moodAccent: {
    height: 2,
    borderRadius: 1,
    marginBottom: 16,
    opacity: 0.4,
  },
  feed: {
    gap: 16,
  },
  venueCard: {
    width: '100%' as any,
  },
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  eventDetail: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'DMSans_400Regular',
  },
});
