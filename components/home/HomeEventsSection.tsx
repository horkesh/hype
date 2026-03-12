import React from 'react';

import { ContentState } from '@/components/ContentState';
import { SectionHeader } from '@/components/SectionHeader';
import { HomeCardRail } from '@/components/home/HomeCardRail';
import { HomeEventCard } from '@/components/home/HomeEventCard';
import { HomeSeriesCard } from '@/components/home/HomeSeriesCard';
import { HomeEventItem, HomeEventSeries } from '@/utils/homeData';
import { HomeLanguage } from '@/utils/homeScreenContent';

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
  return (
    <>
      <SectionHeader title={eventsTitle} actionLabel={seeAllLabel} onPressAction={onSeeAll} />
      <ContentState
        loading={loadingEvents}
        empty={upcomingEvents.length === 0}
        emptyEmoji={'\ud83c\udf06'}
        emptyMessage={emptyEventsMessage}
      >
        <HomeCardRail>
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
        </HomeCardRail>
      </ContentState>

      {eventSeries.length > 0 ? (
        <>
          <SectionHeader title={seriesTitle} />
          <HomeCardRail>
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
          </HomeCardRail>
        </>
      ) : null}
    </>
  );
}
