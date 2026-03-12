import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { SavedBadgeCard } from '@/components/saved/SavedBadgeCard';
import { SavedEmptyState } from '@/components/saved/SavedEmptyState';
import { SavedEventCard } from '@/components/saved/SavedEventCard';
import { SavedVenueCard } from '@/components/saved/SavedVenueCard';
import {
  DEMO_EARNED_BADGES,
  formatSavedBadgeDate,
  formatSavedEventDate,
  getSavedBadgeProgress,
  getSavedEmptyState,
  getSavedPriceLevelDisplay,
  SavedBadge,
  SavedEvent,
  SavedTabKey,
  SavedVenue,
} from '@/utils/savedScreen';

interface SavedTabContentProps {
  accentColor: string;
  activeTab: SavedTabKey;
  backgroundColor: string;
  badges: SavedBadge[];
  cardColor: string;
  eventAtLabel: string;
  events: SavedEvent[];
  freeLabel: string;
  isBosnian: boolean;
  isLoading: boolean;
  isSignedIn: boolean;
  textColor: string;
  textSecondaryColor: string;
  venues: SavedVenue[];
  onPressBadgeRoute: (route: '/(tabs)/profile' | '/(tabs)/explore' | '/(tabs)/tonight') => void;
  onPressEvent: (eventId: string) => void;
  onPressVenue: (venueId: string) => void;
  onRemoveEvent: (eventId: string) => void;
  onRemoveVenue: (venueId: string) => void;
}

export function SavedTabContent({
  accentColor,
  activeTab,
  backgroundColor,
  badges,
  cardColor,
  eventAtLabel,
  events,
  freeLabel,
  isBosnian,
  isLoading,
  isSignedIn,
  textColor,
  textSecondaryColor,
  venues,
  onPressBadgeRoute,
  onPressEvent,
  onPressVenue,
  onRemoveEvent,
  onRemoveVenue,
}: SavedTabContentProps) {
  const emptyState = getSavedEmptyState(activeTab, isSignedIn, isBosnian);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (activeTab === 'venues') {
    if (venues.length === 0) {
      return (
        <SavedEmptyState
          accentColor={accentColor}
          buttonText={emptyState.buttonText}
          emoji={emptyState.emoji}
          onPress={() => onPressBadgeRoute(emptyState.buttonRoute)}
          subtitle={emptyState.subtitle}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
          title={emptyState.title}
        />
      );
    }

    return (
      <ScrollView style={styles.content}>
        <View style={styles.cardsContainer}>
          {venues.map((venue) => (
            <SavedVenueCard
              key={venue.id}
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              cardColor={cardColor}
              getPriceLevelDisplay={getSavedPriceLevelDisplay}
              onDelete={onRemoveVenue}
              onPress={onPressVenue}
              textColor={textColor}
              textSecondaryColor={textSecondaryColor}
              venue={venue}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  if (activeTab === 'events') {
    if (events.length === 0) {
      return (
        <SavedEmptyState
          accentColor={accentColor}
          buttonText={emptyState.buttonText}
          emoji={emptyState.emoji}
          onPress={() => onPressBadgeRoute(emptyState.buttonRoute)}
          subtitle={emptyState.subtitle}
          textColor={textColor}
          textSecondaryColor={textSecondaryColor}
          title={emptyState.title}
        />
      );
    }

    return (
      <ScrollView style={styles.content}>
        <View style={styles.cardsContainer}>
          {events.map((event) => (
            <SavedEventCard
              key={event.id}
              accentColor={accentColor}
              cardColor={cardColor}
              dateDisplay={formatSavedEventDate(event.start_datetime, eventAtLabel)}
              event={event}
              eventTitle={isBosnian ? event.title_bs : event.title_en || event.title_bs}
              onDelete={onRemoveEvent}
              onPress={onPressEvent}
              priceDisplay={event.price_bam ? `${event.price_bam} KM` : freeLabel}
              textColor={textColor}
              textSecondaryColor={textSecondaryColor}
              venueName={event.venues?.name || event.location_name || ''}
            />
          ))}
        </View>
      </ScrollView>
    );
  }

  if (badges.length === 0) {
    return (
      <SavedEmptyState
        accentColor={accentColor}
        buttonText={emptyState.buttonText}
        emoji={emptyState.emoji}
        onPress={() => onPressBadgeRoute(emptyState.buttonRoute)}
        subtitle={emptyState.subtitle}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
        title={emptyState.title}
      />
    );
  }

  return (
    <ScrollView style={styles.content}>
      <View style={styles.badgesGrid}>
        {badges.map((badge) => {
          const isEarned = DEMO_EARNED_BADGES.includes(badge.badge_key);

          return (
            <SavedBadgeCard
              key={badge.id}
              accentColor={accentColor}
              backgroundColor={backgroundColor}
              badge={badge}
              badgeName={isBosnian ? badge.name_bs : badge.name_en}
              earnedDate={formatSavedBadgeDate(new Date().toISOString())}
              isEarned={isEarned}
              progress={getSavedBadgeProgress(badge.badge_key)}
              textColor={textColor}
              textSecondaryColor={textSecondaryColor}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 320,
  },
  cardsContainer: {
    padding: 16,
  },
  badgesGrid: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
});
