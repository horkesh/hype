import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { SavedBadgeGrid } from '@/components/saved/SavedBadgeGrid';
import { SavedEmptyState } from '@/components/saved/SavedEmptyState';
import { SavedEventList } from '@/components/saved/SavedEventList';
import { SavedVenueList } from '@/components/saved/SavedVenueList';
import {
  buildSavedBadgeCardModels,
  buildSavedEventCardModels,
  buildSavedVenueCardModels,
} from '@/utils/savedContent';
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
  const venueModels = buildSavedVenueCardModels(venues, {
    getPriceLevelDisplay: getSavedPriceLevelDisplay,
    moodLookup: SAVED_MOODS,
  });
  const eventModels = buildSavedEventCardModels(events, {
    atLabel: eventAtLabel,
    formatDate: formatSavedEventDate,
    freeLabel,
    isBosnian,
  });
  const badgeModels = buildSavedBadgeCardModels(badges, {
    earnedBadgeKeys: DEMO_EARNED_BADGES,
    formatDate: formatSavedBadgeDate,
    getProgress: getSavedBadgeProgress,
    isBosnian,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={accentColor} />
      </View>
    );
  }

  if (activeTab === 'venues') {
    if (venueModels.length === 0) {
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
      <SavedVenueList
        accentColor={accentColor}
        backgroundColor={backgroundColor}
        cardColor={cardColor}
        models={venueModels}
        onPressVenue={onPressVenue}
        onRemoveVenue={onRemoveVenue}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    );
  }

  if (activeTab === 'events') {
    if (eventModels.length === 0) {
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
      <SavedEventList
        accentColor={accentColor}
        cardColor={cardColor}
        models={eventModels}
        onPressEvent={onPressEvent}
        onRemoveEvent={onRemoveEvent}
        textColor={textColor}
        textSecondaryColor={textSecondaryColor}
      />
    );
  }

  if (badgeModels.length === 0) {
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
    <SavedBadgeGrid
      accentColor={accentColor}
      backgroundColor={backgroundColor}
      models={badgeModels}
      textColor={textColor}
      textSecondaryColor={textSecondaryColor}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 320,
  },
});
