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
} from '@/utils/homeData';
import {
  getEmptyEventsMessage,
  getHomeSectionLabels,
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
  const [upcomingEvents, setUpcomingEvents] = useState<HomeEventItem[]>([]);
  const [eventSeries, setEventSeries] = useState<HomeEventSeries[]>([]);
  const [loadingStatic, setLoadingStatic] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const sectionLabels = getHomeSectionLabels(language);
  const emptyEventsMessage = getEmptyEventsMessage(language);

  const loadStaticContent = useCallback(async (): Promise<void> => {
    setLoadingStatic(true);

    try {
      const content = await loadHomeStaticContent(language);

      setEventSeries(content.eventSeries);
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

  return (
    <TabScreen
      refreshControl={isWeb ? undefined : { refreshing, onRefresh }}
      contentContainerStyle={styles.screenContent}
    >
      <HomeContentSections
        colors={colors}
        emptyEventsMessage={emptyEventsMessage}
        eventSeries={eventSeries}
        language={language}
        loadingEvents={loadingEvents}
        onEventPress={(eventId) => router.push(`/event/${eventId}`)}
        onSeeAll={() => router.push('/(tabs)/tonight')}
        onSelectMood={setSelectedMood}
        onSeriesPress={(seriesId) => router.push(`/series/${seriesId}`)}
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
