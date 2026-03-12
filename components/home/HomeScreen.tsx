import React, { useCallback, useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AnimatedCard } from '@/components/AnimatedCard';
import { ContentState } from '@/components/ContentState';
import { ImageWithPlaceholder } from '@/components/ImageWithPlaceholder';
import { MoodChip } from '@/components/MoodChip';
import { SectionHeader } from '@/components/SectionHeader';
import { TabScreen } from '@/components/TabScreen';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { supabase } from '@/integrations/supabase/client';
import {
  formatEventDateLabel,
  getCafeDescription,
  getDefaultHeroSubtitle,
  getEmptyEventsMessage,
  getHomeSectionLabels,
  getSeriesCountdownLabel,
  getTimeOfDayHeroMessage,
  HOME_MOODS,
} from '@/utils/homeScreenContent';
import { mergeSuggestedMood } from '@/utils/homeWeather';
import { publicConfig } from '@/utils/publicConfig';

interface Venue {
  id: string;
  name: string;
  cover_image_url: string | null;
  neighborhood: string | null;
  description_bs: string | null;
  description_en: string | null;
}

interface EventItem {
  id: string;
  title_bs: string;
  title_en: string | null;
  cover_image_url: string | null;
  start_datetime: string;
  moods: string[];
  price_bam: number | null;
  location_name: string | null;
  venues?: Array<{
    name: string;
  }> | null;
}

interface EventSeries {
  id: string;
  name_bs: string;
  name_en: string;
  cover_image_url: string | null;
  start_date: string;
  end_date: string;
}

const OPENWEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';
const OPENWEATHER_API_KEY = publicConfig.openWeatherApiKey;
const WEATHER_MESSAGES = {
  clear: {
    bs: 'Savrsen dan za bastu! ☀️',
    en: 'Perfect day for outdoor plans! ☀️',
  },
  rain: {
    bs: 'Kisovito vrijeme - idealno za kafic 🌧️',
    en: 'Rainy weather - perfect for a cafe 🌧️',
  },
  cold: {
    bs: 'Hladno je - vrijeme za topli napitak ☕',
    en: 'Cold outside - time for a warm drink ☕',
  },
} as const;

export function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useApp();
  const isWeb = Platform.OS === 'web';

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [heroMessage, setHeroMessage] = useState('');
  const [randomCafe, setRandomCafe] = useState<Venue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [eventSeries, setEventSeries] = useState<EventSeries[]>([]);
  const [loadingStatic, setLoadingStatic] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sectionLabels = getHomeSectionLabels(language);
  const heroSubtitle = getDefaultHeroSubtitle(language);
  const emptyEventsMessage = getEmptyEventsMessage(language);

  const loadRandomCafe = useCallback(async (): Promise<void> => {
    const { data, error } = await supabase
      .from('venues')
      .select('id, name, cover_image_url, neighborhood, description_bs, description_en')
      .eq('category', 'cafe')
      .limit(10);

    if (error || !data?.length) {
      setRandomCafe(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * data.length);
    setRandomCafe(data[randomIndex]);
  }, []);

  const loadEventSeries = useCallback(async (): Promise<void> => {
    const { data } = await supabase
      .from('event_series')
      .select('id, name_bs, name_en, cover_image_url, start_date, end_date')
      .eq('is_active', true)
      .gte('end_date', new Date().toISOString().split('T')[0])
      .order('start_date', { ascending: true })
      .limit(5);

    setEventSeries(data ?? []);
  }, []);

  const loadUpcomingEvents = useCallback(async (): Promise<void> => {
    let query = supabase
      .from('events')
      .select('id, title_bs, title_en, cover_image_url, start_datetime, moods, price_bam, location_name, venues(name)')
      .gte('start_datetime', new Date().toISOString())
      .order('start_datetime', { ascending: true })
      .limit(10);

    if (selectedMood) {
      query = query.contains('moods', [selectedMood]);
    }

    const { data } = await query;
    setUpcomingEvents(data ?? []);
  }, [selectedMood]);

  const fetchWeather = useCallback(async (): Promise<void> => {
    const baseMessage = getTimeOfDayHeroMessage(language, new Date().getHours());

    if (!OPENWEATHER_API_KEY) {
      setHeroMessage(baseMessage);
      return;
    }

    try {
      const response = await fetch(
        `${OPENWEATHER_API_URL}?lat=43.8563&lon=18.4131&units=metric&appid=${OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      const weatherCondition = data?.weather?.[0]?.main?.toLowerCase?.() ?? '';
      const temp = Math.round(data?.main?.temp ?? 0);

      let nextMessage = baseMessage;
      let suggestedMood: string | null = null;

      if (weatherCondition.includes('clear') && temp > 20) {
        nextMessage = WEATHER_MESSAGES.clear[language];
        suggestedMood = 'outdoor';
      } else if (weatherCondition.includes('rain')) {
        nextMessage = WEATHER_MESSAGES.rain[language];
        suggestedMood = 'chill';
      } else if (temp < 10) {
        nextMessage = WEATHER_MESSAGES.cold[language];
        suggestedMood = 'chill';
      }

      setHeroMessage(nextMessage);
      setSelectedMood(currentMood => mergeSuggestedMood(currentMood, suggestedMood));
    } catch (error) {
      console.log('Home weather fetch failed, using fallback message', error);
      setHeroMessage(baseMessage);
    }
  }, [language]);

  const loadStaticContent = useCallback(async (): Promise<void> => {
    setLoadingStatic(true);

    try {
      await Promise.all([loadRandomCafe(), loadEventSeries(), fetchWeather()]);
    } finally {
      setLoadingStatic(false);
    }
  }, [fetchWeather, loadEventSeries, loadRandomCafe]);

  const loadEventContent = useCallback(async (): Promise<void> => {
    setLoadingEvents(true);

    try {
      await loadUpcomingEvents();
    } finally {
      setLoadingEvents(false);
    }
  }, [loadUpcomingEvents]);

  useEffect(() => {
    void loadStaticContent();
  }, [loadStaticContent]);

  useEffect(() => {
    void loadEventContent();
  }, [loadEventContent]);

  const onRefresh = useCallback((): void => {
    setRefreshing(true);

    void Promise.all([loadStaticContent(), loadEventContent()]).finally(() => {
      setRefreshing(false);
    });
  }, [loadEventContent, loadStaticContent]);

  function handleEventTap(eventId: string): void {
    router.push(`/event/${eventId}`);
  }

  function handleVenueTap(venueId: string): void {
    router.push(`/venue/${venueId}`);
  }

  function handleSeriesTap(seriesId: string): void {
    router.push(`/series/${seriesId}`);
  }

  function renderEventCard(event: EventItem, index: number): React.ReactElement {
    const eventTitle = language === 'bs' ? event.title_bs : (event.title_en || event.title_bs);
    const eventDate = formatEventDateLabel(language, event.start_datetime);
    const venueName = event.venues?.[0]?.name || event.location_name || '';
    const priceText = event.price_bam
      ? `${event.price_bam} KM`
      : (language === 'bs' ? 'Besplatno' : 'Free');

    return (
      <AnimatedCard key={event.id} delay={isWeb ? 0 : index * 50}>
        <TouchableOpacity
          style={[styles.eventCard, styles.blockCard, { backgroundColor: colors.card }]}
          onPress={() => handleEventTap(event.id)}
          activeOpacity={0.8}
        >
          <ImageWithPlaceholder
            source={event.cover_image_url}
            style={styles.eventImage}
            categoryEmoji="🎉"
            borderRadius={0}
          />
          <View style={styles.eventContent}>
            <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={2}>
              {eventTitle}
            </Text>
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
              {eventDate}
            </Text>
            {venueName ? (
              <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
                {venueName}
              </Text>
            ) : null}
            <Text style={[styles.eventDetailText, { color: colors.accent }]}>
              {priceText}
            </Text>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  }

  function renderSeriesCard(series: EventSeries, index: number): React.ReactElement {
    const seriesName = language === 'bs' ? series.name_bs : series.name_en;
    const countdown = getSeriesCountdownLabel(language, series.start_date, series.end_date);

    return (
      <AnimatedCard key={series.id} delay={isWeb ? 0 : index * 50}>
        <TouchableOpacity
          style={[styles.seriesCard, styles.blockCard, { backgroundColor: colors.card }]}
          onPress={() => handleSeriesTap(series.id)}
          activeOpacity={0.8}
        >
          <ImageWithPlaceholder
            source={series.cover_image_url}
            style={styles.seriesImage}
            categoryEmoji="🎭"
            borderRadius={0}
          />
          <View style={styles.seriesContent}>
            <Text style={[styles.seriesTitle, { color: colors.text }]} numberOfLines={2}>
              {seriesName}
            </Text>
            <Text style={[styles.seriesCountdown, { color: colors.accent }]}>
              {countdown}
            </Text>
          </View>
        </TouchableOpacity>
      </AnimatedCard>
    );
  }

  const heroTitle = heroMessage || getTimeOfDayHeroMessage(language, new Date().getHours());
  const cafeDescription = getCafeDescription(
    language,
    randomCafe?.description_bs ?? null,
    randomCafe?.description_en ?? null
  );

  return (
    <TabScreen
      refreshControl={isWeb ? undefined : { refreshing, onRefresh }}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.heroSection}>
        <AnimatedCard style={styles.heroCard}>
          <LinearGradient
            colors={['#D4A056', '#B8894A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
          >
            <Text style={styles.heroTitle}>{heroTitle}</Text>
            <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
          </LinearGradient>
        </AnimatedCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title={sectionLabels.moods} />
        <View style={styles.moodsContainer}>
          <View style={styles.moodsGrid}>
            {HOME_MOODS.map(mood => {
              const moodLabel = language === 'bs' ? mood.label_bs : mood.label_en;
              const isSelected = selectedMood === mood.id;

              return (
                <MoodChip
                  key={mood.id}
                  emoji={mood.emoji}
                  label={moodLabel}
                  isSelected={isSelected}
                  onPress={() => setSelectedMood(isSelected ? null : mood.id)}
                  moodId={mood.id}
                />
              );
            })}
          </View>
        </View>
      </View>

      {randomCafe ? (
        <View style={styles.section}>
          <SectionHeader title={sectionLabels.cafes} />
          <AnimatedCard delay={isWeb ? 0 : 100}>
            <TouchableOpacity
              style={[styles.featuredCard, { backgroundColor: colors.card }]}
              onPress={() => handleVenueTap(randomCafe.id)}
              activeOpacity={0.8}
            >
              <ImageWithPlaceholder
                source={randomCafe.cover_image_url}
                style={styles.featuredImage}
                categoryEmoji="☕"
                borderRadius={0}
              />
              <View style={styles.featuredContent}>
                <Text style={[styles.featuredTitle, { color: colors.text }]}>{randomCafe.name}</Text>
                {randomCafe.neighborhood ? (
                  <Text style={[styles.featuredMeta, { color: colors.textSecondary }]}>
                    {randomCafe.neighborhood}
                  </Text>
                ) : null}
                {cafeDescription ? (
                  <Text
                    style={[styles.featuredDescription, { color: colors.textSecondary }]}
                    numberOfLines={2}
                  >
                    {cafeDescription}
                  </Text>
                ) : null}
              </View>
            </TouchableOpacity>
          </AnimatedCard>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionHeader
          title={sectionLabels.events}
          actionLabel={sectionLabels.seeAll}
          onPressAction={() => router.push('/(tabs)/tonight')}
        />
        <ContentState
          loading={loadingEvents}
          empty={upcomingEvents.length === 0}
          emptyEmoji="🌆"
          emptyMessage={emptyEventsMessage}
        >
          {isWeb ? (
            <View style={styles.webStack}>
              {upcomingEvents.map((event, index) => renderEventCard(event, index))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {upcomingEvents.map((event, index) => renderEventCard(event, index))}
            </ScrollView>
          )}
        </ContentState>
      </View>

      {eventSeries.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title={sectionLabels.series} />
          {isWeb ? (
            <View style={styles.webStack}>
              {eventSeries.map((series, index) => renderSeriesCard(series, index))}
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
            >
              {eventSeries.map((series, index) => renderSeriesCard(series, index))}
            </ScrollView>
          )}
        </View>
      ) : null}

      {loadingStatic ? <View style={styles.bottomSpacer} /> : null}
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 120,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroGradient: {
    padding: 24,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
  },
  section: {
    marginBottom: 32,
  },
  moodsContainer: {
    paddingHorizontal: 20,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
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
  bottomSpacer: {
    height: 24,
  },
});
