import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HomeEventsSection } from '@/components/home/HomeEventsSection';
import { HomeFeaturedCafeSection } from '@/components/home/HomeFeaturedCafeSection';
import { HomeHeroSection } from '@/components/home/HomeHeroSection';
import { HomeMoodSection } from '@/components/home/HomeMoodSection';
import { HomeEventItem, HomeEventSeries, HomeVenue } from '@/utils/homeData';
import { HomeLanguage } from '@/utils/homeHeroState';

interface HomeContentSectionsProps {
  cafeDescription: string;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  emptyEventsMessage: string;
  eventSeries: HomeEventSeries[];
  heroSubtitle: string;
  heroTitle: string;
  isWeb: boolean;
  language: HomeLanguage;
  loadingEvents: boolean;
  onEventPress: (eventId: string) => void;
  onRandomCafePress: (venueId: string) => void;
  onSeeAll: () => void;
  onSelectMood: (mood: string | null) => void;
  onSeriesPress: (seriesId: string) => void;
  randomCafe: HomeVenue | null;
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
  cafeDescription,
  colors,
  emptyEventsMessage,
  eventSeries,
  heroSubtitle,
  heroTitle,
  isWeb,
  language,
  loadingEvents,
  onEventPress,
  onRandomCafePress,
  onSeeAll,
  onSelectMood,
  onSeriesPress,
  randomCafe,
  sectionLabels,
  selectedMood,
  upcomingEvents,
}: HomeContentSectionsProps) {
  return (
    <>
      <View style={styles.heroSection}>
        <HomeHeroSection title={heroTitle} subtitle={heroSubtitle} />
      </View>

      <View style={styles.section}>
        <HomeMoodSection
          language={language}
          selectedMood={selectedMood}
          title={sectionLabels.moods}
          onSelectMood={onSelectMood}
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
            onPress={onRandomCafePress}
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
          onSeeAll={onSeeAll}
          onEventPress={onEventPress}
          onSeriesPress={onSeriesPress}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
});
