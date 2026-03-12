import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimatedCard } from '@/components/AnimatedCard';
import { ContentState } from '@/components/ContentState';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { SectionHeader } from '@/components/SectionHeader';
import { HomeEventItem, HomeEventSeries } from '@/utils/homeData';
import {
  formatEventDateLabel,
  getSeriesCountdownLabel,
  HomeLanguage,
} from '@/utils/homeScreenContent';

interface HomeEventsSectionProps {
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  loadingEvents: boolean;
  emptyEventsMessage: string;
  eventsTitle: string;
  seeAllLabel: string;
  seriesTitle: string;
  upcomingEvents: HomeEventItem[];
  eventSeries: HomeEventSeries[];
  onSeeAll: () => void;
  onEventPress: (eventId: string) => void;
  onSeriesPress: (seriesId: string) => void;
}

export function HomeEventsSection({
  language,
  colors,
  loadingEvents,
  emptyEventsMessage,
  eventsTitle,
  seeAllLabel,
  seriesTitle,
  upcomingEvents,
  eventSeries,
  onSeeAll,
  onEventPress,
  onSeriesPress,
}: HomeEventsSectionProps) {
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <SectionHeader title={eventsTitle} actionLabel={seeAllLabel} onPressAction={onSeeAll} />
      <ContentState
        loading={loadingEvents}
        empty={upcomingEvents.length === 0}
        emptyEmoji={'\ud83c\udf06'}
        emptyMessage={emptyEventsMessage}
      >
        {isWeb ? (
          <View style={styles.webStack}>
            {upcomingEvents.map((event, index) => (
              <HomeEventCard
                key={event.id}
                event={event}
                index={index}
                language={language}
                colors={colors}
                onPress={onEventPress}
              />
            ))}
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.rail}
          >
            {upcomingEvents.map((event, index) => (
              <HomeEventCard
                key={event.id}
                event={event}
                index={index}
                language={language}
                colors={colors}
                onPress={onEventPress}
              />
            ))}
          </ScrollView>
        )}
      </ContentState>

      {eventSeries.length > 0 ? (
        <>
          <SectionHeader title={seriesTitle} />
          {isWeb ? (
            <View style={styles.webStack}>
              {eventSeries.map((series, index) => (
                <HomeSeriesCard
                  key={series.id}
                  series={series}
                  index={index}
                  language={language}
                  colors={colors}
                  onPress={onSeriesPress}
                />
              ))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {eventSeries.map((series, index) => (
                <HomeSeriesCard
                  key={series.id}
                  series={series}
                  index={index}
                  language={language}
                  colors={colors}
                  onPress={onSeriesPress}
                />
              ))}
            </ScrollView>
          )}
        </>
      ) : null}
    </>
  );
}

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

function HomeEventCard({ event, index, language, colors, onPress }: HomeEventCardProps) {
  const isWeb = Platform.OS === 'web';
  const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
  const eventDate = formatEventDateLabel(language, event.start_datetime);
  const venueName = event.venues?.[0]?.name || event.location_name || '';
  const priceText = event.price_bam ? `${event.price_bam} KM` : (language === 'bs' ? 'Besplatno' : 'Free');

  return (
    <AnimatedCard delay={isWeb ? 0 : index * 50}>
      <TouchableOpacity
        style={[styles.eventCard, styles.blockCard, { backgroundColor: colors.card }]}
        onPress={() => onPress(event.id)}
        activeOpacity={0.8}
      >
        <ImageWithPlaceholder
          source={event.cover_image_url}
          style={styles.eventImage}
          categoryEmoji={'\ud83c\udf89'}
          borderRadius={0}
        />
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
            {eventTitle}
          </Text>
          <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{eventDate}</Text>
          {venueName ? (
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>{venueName}</Text>
          ) : null}
          <Text style={[styles.eventDetailText, { color: colors.accent }]}>{priceText}</Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

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

function HomeSeriesCard({ series, index, language, colors, onPress }: HomeSeriesCardProps) {
  const isWeb = Platform.OS === 'web';
  const seriesName = language === 'bs' ? series.name_bs : series.name_en;
  const countdown = getSeriesCountdownLabel(language, series.start_date, series.end_date);

  return (
    <AnimatedCard delay={isWeb ? 0 : index * 50}>
      <TouchableOpacity
        style={[styles.seriesCard, styles.blockCard, { backgroundColor: colors.card }]}
        onPress={() => onPress(series.id)}
        activeOpacity={0.8}
      >
        <ImageWithPlaceholder
          source={series.cover_image_url}
          style={styles.seriesImage}
          categoryEmoji={'\ud83c\udfad'}
          borderRadius={0}
        />
        <View style={styles.seriesContent}>
          <Text style={[styles.seriesTitle, { color: colors.text }]} numberOfLines={2}>
            {seriesName}
          </Text>
          <Text style={[styles.seriesCountdown, { color: colors.accent }]}>{countdown}</Text>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  rail: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  webStack: {
    paddingHorizontal: 20,
    gap: 16,
  },
  blockCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  eventCard: {
    width: 280,
    marginRight: 16,
  },
  eventImage: {
    width: '100%',
    height: 160,
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
  eventDetailText: {
    fontSize: 14,
    marginBottom: 4,
    fontFamily: 'DMSans_400Regular',
  },
  seriesCard: {
    width: 300,
    marginRight: 16,
  },
  seriesImage: {
    width: '100%',
    height: 180,
  },
  seriesContent: {
    padding: 16,
  },
  seriesTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  seriesCountdown: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'DMSans_500Medium',
  },
});
