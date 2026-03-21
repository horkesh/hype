import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeCityPulse } from '@/components/home/HomeCityPulse';
import { HomeEventsSection } from '@/components/home/HomeEventsSection';
import { HomeHeroPhoto } from '@/components/home/HomeHeroPhoto';
import { HomeHiddenGems } from '@/components/home/HomeHiddenGems';
import { HomeKafuSection } from '@/components/home/HomeKafuSection';
import { HomeMoodSection } from '@/components/home/HomeMoodSection';
import { HomeSurpriseMe } from '@/components/home/HomeSurpriseMe';
import { HomeTrendingSection } from '@/components/home/HomeTrendingSection';
import { HomeEventItem, HomeEventSeries, loadHomeWeather } from '@/utils/homeData';
import { HomeLanguage } from '@/utils/homeHeroState';
import { fetchHeroImage } from '@/utils/ai/heroImage';

interface HomeContentSectionsProps {
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  emptyEventsMessage: string;
  eventSeries: HomeEventSeries[];
  language: HomeLanguage;
  loadingEvents: boolean;
  onEventPress: (eventId: string) => void;
  onSeeAll: () => void;
  onSelectMood: (mood: string | null) => void;
  onSeriesPress: (seriesId: string) => void;
  sectionLabels: {
    cafes: string;
    events: string;
    moods: string;
    seeAll: string;
    series: string;
  };
  selectedMood: string | null;
  upcomingEvents: HomeEventItem[];
}

export function HomeContentSections({
  colors,
  emptyEventsMessage,
  eventSeries,
  language,
  loadingEvents,
  onEventPress,
  onSeeAll,
  onSelectMood,
  onSeriesPress,
  sectionLabels,
  selectedMood,
  upcomingEvents,
}: HomeContentSectionsProps) {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const weather = await loadHomeWeather().catch(() => null);
      const url = await fetchHeroImage({ weather }).catch(() => null);
      if (mounted && url) setHeroImageUrl(url);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <HomeHeroPhoto language={language} heroImageUrl={heroImageUrl}>
        <HomeCityPulse language={language} />
        <HomeSurpriseMe language={language} />
      </HomeHeroPhoto>

      <View style={styles.section}>
        <HomeMoodSection
          language={language}
          selectedMood={selectedMood}
          title={sectionLabels.moods}
          onSelectMood={onSelectMood}
        />
      </View>

      <View style={styles.section}>
        <HomeTrendingSection language={language} selectedMood={selectedMood} />
      </View>

      <View style={styles.section}>
        <HomeKafuSection language={language} selectedMood={selectedMood} />
      </View>

      <View style={styles.section}>
        <HomeHiddenGems language={language} selectedMood={selectedMood} />
      </View>

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
          onSeeAll={onSeeAll}
          onEventPress={onEventPress}
          onSeriesPress={onSeriesPress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
