import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ContentState } from '@/components/ContentState';
import { TabScreen } from '@/components/TabScreen';
import { HomeEventsSection } from '@/components/home/HomeEventsSection';
import { HomeFeaturedCafeSection } from '@/components/home/HomeFeaturedCafeSection';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeMoodSection } from '@/components/home/HomeMoodSection';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import {
  HomeEventItem,
  HomeEventSeries,
  HomeVenue,
  loadHomeEventSeries,
  loadHomeRandomCafe,
  loadHomeUpcomingEvents,
  loadHomeWeather,
} from '@/utils/homeData';
import {
  getCafeDescription,
  getDefaultHeroSubtitle,
  getEmptyEventsMessage,
  getHomeSectionLabels,
  getTimeOfDayHeroMessage,
} from '@/utils/homeScreenContent';
import { mergeSuggestedMood } from '@/utils/homeWeather';

const WEATHER_MESSAGES = {
  clear: {
    bs: 'Savrsen dan za bastu! \u2600\ufe0f',
    en: 'Perfect day for outdoor plans! \u2600\ufe0f',
  },
  rain: {
    bs: 'Kisovito vrijeme, idealno za kafic \ud83c\udf27\ufe0f',
    en: 'Rainy weather, perfect for a cafe \ud83c\udf27\ufe0f',
  },
  cold: {
    bs: 'Hladno je, vrijeme za topli napitak \u2615',
    en: 'Cold outside, time for a warm drink \u2615',
  },
} as const;

export function HomeScreen(): React.ReactElement {
  const router = useRouter();
  const { colors } = useTheme();
  const { language } = useApp();
  const isWeb = Platform.OS === 'web';

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [heroMessage, setHeroMessage] = useState('');
  const [randomCafe, setRandomCafe] = useState<HomeVenue | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEventItem[]>([]);
  const [eventSeries, setEventSeries] = useState<HomeEventSeries[]>([]);
  const [loadingStatic, setLoadingStatic] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sectionLabels = getHomeSectionLabels(language);
  const heroSubtitle = getDefaultHeroSubtitle(language);
  const emptyEventsMessage = getEmptyEventsMessage(language);

  const loadStaticContent = useCallback(async (): Promise<void> => {
    setLoadingStatic(true);

    try {
      const [cafe, series, weather] = await Promise.all([
        loadHomeRandomCafe(),
        loadHomeEventSeries(),
        loadHomeWeather().catch((error) => {
          console.log('Home weather fetch failed, using fallback message', error);
          return null;
        }),
      ]);

      setRandomCafe(cafe);
      setEventSeries(series);

      const baseMessage = getTimeOfDayHeroMessage(language, new Date().getHours());
      if (!weather) {
        setHeroMessage(baseMessage);
        return;
      }

      let nextMessage = baseMessage;
      let suggestedMood: string | null = null;

      if (weather.weatherCondition.includes('clear') && weather.temp > 20) {
        nextMessage = WEATHER_MESSAGES.clear[language];
        suggestedMood = 'outdoor';
      } else if (weather.weatherCondition.includes('rain')) {
        nextMessage = WEATHER_MESSAGES.rain[language];
        suggestedMood = 'chill';
      } else if (weather.temp < 10) {
        nextMessage = WEATHER_MESSAGES.cold[language];
        suggestedMood = 'chill';
      }

      setHeroMessage(nextMessage);
      setSelectedMood((currentMood) => mergeSuggestedMood(currentMood, suggestedMood));
    } finally {
      setLoadingStatic(false);
    }
  }, [language]);

  const loadEventContent = useCallback(async (): Promise<void> => {
    setLoadingEvents(true);

    try {
      setUpcomingEvents(await loadHomeUpcomingEvents(selectedMood));
    } finally {
      setLoadingEvents(false);
    }
  }, [selectedMood]);

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
        <HomeHeroSection title={heroTitle} subtitle={heroSubtitle} />
      </View>

      <View style={styles.section}>
        <HomeMoodSection
          language={language}
          selectedMood={selectedMood}
          title={sectionLabels.moods}
          onSelectMood={setSelectedMood}
        />
      </View>

      {randomCafe ? (
        <View style={styles.section}>
          <HomeFeaturedCafeSection
            cafe={randomCafe}
            colors={colors}
            title={sectionLabels.cafes}
            description={cafeDescription}
            isWeb={isWeb}
            onPress={(venueId) => router.push(`/venue/${venueId}`)}
          />
        </View>
      ) : null}

      <View style={styles.section}>
        <HomeEventsSection
          language={language}
          colors={colors}
          loadingEvents={loadingEvents}
          emptyEventsMessage={emptyEventsMessage}
          eventsTitle={sectionLabels.events}
          seeAllLabel={sectionLabels.seeAll}
          seriesTitle={sectionLabels.series}
          upcomingEvents={upcomingEvents}
          eventSeries={eventSeries}
          onSeeAll={() => router.push('/(tabs)/tonight')}
          onEventPress={(eventId) => router.push(`/event/${eventId}`)}
          onSeriesPress={(seriesId) => router.push(`/series/${seriesId}`)}
        />
      </View>

      <ContentState loading={loadingStatic} empty={false}>
        <View style={styles.bottomSpacer} />
      </ContentState>
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
  section: {
    marginBottom: 32,
  },
  bottomSpacer: {
    height: 24,
  },
});
