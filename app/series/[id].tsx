import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { SeriesDetailActions } from '@/components/series/SeriesDetailActions';
import { SeriesDetailHero } from '@/components/series/SeriesDetailHero';
import { SeriesEventsSection } from '@/components/series/SeriesEventsSection';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import {
  loadSeriesDetail,
  loadSeriesEvents,
  loadSeriesSavedState,
  toggleSeriesSavedState,
} from '@/utils/seriesDetailData';
import {
  formatSeriesDateRange,
  getSeriesCategoryEmoji,
  getSeriesCountdownStatus,
  getSeriesDescription,
  getSeriesDetailCopy,
  getSeriesTitle,
  groupSeriesEventsByDate,
  SeriesDetailEvent,
  SeriesDetailSeries,
} from '@/utils/seriesDetailScreen';

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();

  const [series, setSeries] = useState<SeriesDetailSeries | null>(null);
  const [events, setEvents] = useState<SeriesDetailEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isCancelled = false;

    setLoading(true);
    setSeries(null);
    setEvents([]);

    (async () => {
      try {
        const [nextSeries, nextEvents, nextSaved] = await Promise.all([
          loadSeriesDetail(id),
          loadSeriesEvents(id),
          loadSeriesSavedState(id),
        ]);

        if (isCancelled) {
          return;
        }

        setSeries(nextSeries);
        setEvents(nextEvents);
        setIsSaved(nextSaved);
      } catch (error) {
        console.error('Error loading series detail:', error);
        if (!isCancelled) {
          setSeries(null);
          setEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <>
        <Stack.Screen options={{ title: t('loading'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (!series) {
    return (
      <>
        <Stack.Screen options={{ title: t('error'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{t('error')}</Text>
        </View>
      </>
    );
  }

  const title = getSeriesTitle(series, language);
  const description = getSeriesDescription(series, language);
  const copy = getSeriesDetailCopy(language);
  const groupedEvents = groupSeriesEventsByDate(events, language);

  const handleOpenUrl = async (url: string | null) => {
    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening series URL:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!id) {
      return;
    }

    try {
      setIsSaved(await toggleSeriesSavedState(id));
    } catch (error) {
      console.error('Error toggling series save state:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title, headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <SeriesDetailHero
          imageSource={series.cover_image_url}
          title={title}
          dateRange={formatSeriesDateRange(series, language)}
          category={series.category}
          categoryEmoji={getSeriesCategoryEmoji(series.category)}
          countdownStatus={getSeriesCountdownStatus(series, language)}
          colors={colors}
        />

        <View style={styles.content}>
          {description ? (
            <View style={styles.descriptionSection}>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {description}
              </Text>
            </View>
          ) : null}

          <SeriesDetailActions
            colors={colors}
            labels={copy}
            hasWebsite={Boolean(series.website_url)}
            hasTickets={Boolean(series.ticket_url)}
            isSaved={isSaved}
            onWebsitePress={() => handleOpenUrl(series.website_url)}
            onTicketPress={() => handleOpenUrl(series.ticket_url)}
            onSavePress={handleToggleSave}
          />

          <SeriesEventsSection
            groupedEvents={groupedEvents}
            language={language}
            colors={colors}
            onEventPress={(eventId) => router.push(`/event/${eventId}`)}
            onEventTicketPress={(ticketUrl) => {
              handleOpenUrl(ticketUrl);
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  descriptionSection: {
    marginBottom: 20,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
});
