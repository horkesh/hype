import React, { useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ContentState } from '@/components/ContentState';
import { TabScreen } from '@/components/TabScreen';
import { HomeContentSections } from '@/components/home/HomeContentSections';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import {
  HomeEventItem,
  HomeEventSeries,
  HomeVenue,
} from '@/utils/homeData';
import {
  getCafeDescription,
  getDefaultHeroSubtitle,
  getEmptyEventsMessage,
  getHomeSectionLabels,
  getTimeOfDayHeroMessage,
} from '@/utils/homeScreenContent';
import {
  loadHomeEventsForMood,
  loadHomeStaticContent,
  mergeHomeSuggestedMood,
} from '@/utils/homeScreen';

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
      const content = await loadHomeStaticContent(language);

      setRandomCafe(content.randomCafe);
      setEventSeries(content.eventSeries);
      setHeroMessage(content.heroMessage);
      setSelectedMood((currentMood) => mergeHomeSuggestedMood(currentMood, content.suggestedMood));
    } finally {
      setLoadingStatic(false);
    }
  }, [language]);

  const loadEventContent = useCallback(async (): Promise<void> => {
    setLoadingEvents(true);

    try {
      setUpcomingEvents(await loadHomeEventsForMood(selectedMood));
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
      <HomeContentSections
        cafeDescription={cafeDescription}
        colors={colors}
        emptyEventsMessage={emptyEventsMessage}
        eventSeries={eventSeries}
        heroSubtitle={heroSubtitle}
        heroTitle={heroTitle}
        isWeb={isWeb}
        language={language}
        loadingEvents={loadingEvents}
        onEventPress={(eventId) => router.push(`/event/${eventId}`)}
        onRandomCafePress={(venueId) => router.push(`/venue/${venueId}`)}
        onSeeAll={() => router.push('/(tabs)/tonight')}
        onSelectMood={setSelectedMood}
        onSeriesPress={(seriesId) => router.push(`/series/${seriesId}`)}
        randomCafe={randomCafe}
        sectionLabels={sectionLabels}
        selectedMood={selectedMood}
        upcomingEvents={upcomingEvents}
      />

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
  bottomSpacer: {
    height: 24,
  },
});
