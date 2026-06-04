import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createClient } from '@supabase/supabase-js';

import { HypeHeader } from '@/components/HypeHeader';
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

// Emit one HTML file per active series so /series/<id> works on direct load,
// is shareable, and gets SEO (mirrors venue/[id] + event/[id]). Without this,
// the static export produces no series pages and Vercel returns 404.
export async function generateStaticParams(): Promise<{ id: string }[]> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from('event_series').select('id').eq('is_active', true);
  if (error) return [];
  return (data ?? []).map((s) => ({ id: s.id as string }));
}

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
        <HypeHeader />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (!series) {
    return (
      <>
        <HypeHeader />
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
      <HypeHeader />
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
