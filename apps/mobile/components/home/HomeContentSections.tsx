import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeCategoryFeed } from '@/components/home/HomeCategoryFeed';
import { HomeCategoryGrid } from '@/components/home/HomeCategoryGrid';
import { HomeCityPulse } from '@/components/home/HomeCityPulse';
import { HomeEventsSection } from '@/components/home/HomeEventsSection';
import { HomeHeroPhoto } from '@/components/home/HomeHeroPhoto';
import { HomeFeaturedVenues } from '@/components/home/HomeFeaturedVenues';
import { HomeHiddenGems } from '@/components/home/HomeHiddenGems';
import { HomeMoodFeed } from '@/components/home/HomeMoodFeed';
import { HomeMoodSection } from '@/components/home/HomeMoodSection';
import { HomeSurpriseMe } from '@/components/home/HomeSurpriseMe';
import { HomeMajorEvents } from '@/components/home/HomeMajorEvents';
import { HomeWorldCupStrip } from '@/components/home/HomeWorldCupStrip';
import { HomeFeaturedSection } from '@/components/home/HomeFeaturedSection';
import { HomeHeritageSection } from '@/components/home/HomeHeritageSection';
import { HomeTrendingSection } from '@/components/home/HomeTrendingSection';
import { TelemachPackagesSection } from '@/components/telemach/TelemachPackagesSection';
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
  onSelectCategory: (category: string | null) => void;
  onSelectMood: (mood: string | null) => void;
  onSeriesPress: (seriesId: string) => void;
  selectedCategory: string | null;
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
  onSelectCategory,
  onSelectMood,
  onSeriesPress,
  selectedCategory,
  sectionLabels,
  selectedMood,
  upcomingEvents,
}: HomeContentSectionsProps) {
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const w = await loadHomeWeather().catch(() => null);
      // Map weatherCondition → condition for downstream consumers
      const mapped = w ? { temp: w.temp, condition: w.weatherCondition } : null;
      if (mounted) setWeather(mapped);
      const url = await fetchHeroImage({ weather: mapped }).catch(() => null);
      if (mounted && url) setHeroImageUrl(url);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <>
      <HomeHeroPhoto language={language} heroImageUrl={heroImageUrl}>
        <HomeCityPulse language={language} weather={weather} />
        <HomeSurpriseMe language={language} />
      </HomeHeroPhoto>

      {/* Category grid — always visible */}
      <View style={styles.section}>
        <HomeCategoryGrid
          language={language}
          selectedCategory={selectedCategory}
          onSelectCategory={onSelectCategory}
        />
      </View>

      {/* Mood chips — always visible below category grid */}
      <View style={styles.section}>
        <HomeMoodSection
          language={language}
          selectedMood={selectedMood}
          title={sectionLabels.moods}
          onSelectMood={onSelectMood}
        />
      </View>

      {/* Content: category → filtered list, mood → mood feed, default → editorial */}
      {selectedCategory != null ? (
        /* Category selected (with optional mood boost) */
        <View style={styles.section}>
          <HomeCategoryFeed
            category={selectedCategory}
            selectedMood={selectedMood}
            language={language}
          />
        </View>
      ) : selectedMood != null ? (
        /* Mood only — existing mood feed */
        <View style={styles.section}>
          <HomeMoodFeed
            moodId={selectedMood}
            language={language}
            colors={colors}
            onEventPress={onEventPress}
          />
        </View>
      ) : (
        /* Default editorial magazine sections */
        <>
          <View style={styles.section}>
            <HomeMajorEvents language={language} />
          </View>

          <View style={styles.section}>
            <HomeWorldCupStrip language={language} />
          </View>

          <View style={styles.section}>
            <HomeFeaturedVenues language={language} selectedMood={selectedMood} />
          </View>

          <View style={styles.section}>
            <TelemachPackagesSection language={language} />
          </View>

          <View style={styles.section}>
            <HomeFeaturedSection language={language} colors={colors} onEventPress={onEventPress} />
          </View>

          <View style={styles.section}>
            <HomeTrendingSection language={language} selectedMood={selectedMood} />
          </View>

          <View style={styles.section}>
            <HomeHeritageSection language={language} colors={colors} />
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
      )}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
});
