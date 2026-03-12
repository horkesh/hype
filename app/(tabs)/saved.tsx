import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { SavedBadgeCard } from '@/components/saved/SavedBadgeCard';
import { SavedEmptyState } from '@/components/saved/SavedEmptyState';
import { SavedEventCard } from '@/components/saved/SavedEventCard';
import { SavedTabs } from '@/components/saved/SavedTabs';
import { SavedVenueCard } from '@/components/saved/SavedVenueCard';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { subscribeToAuthChanges } from '@/utils/authSession';
import { isFavoritesAuthRequiredError } from '@/utils/favorites';
import {
  loadSavedBadges,
  loadSavedEvents,
  loadSavedVenues,
  removeSavedEvent,
  removeSavedVenue,
} from '@/utils/savedData';
import {
  DEMO_EARNED_BADGES,
  formatSavedBadgeDate,
  formatSavedEventDate,
  getSavedBadgeProgress,
  getSavedPriceLevelDisplay,
  SavedBadge,
  SavedEvent,
  SavedTabKey,
  SavedVenue,
} from '@/utils/savedScreen';

export default function SavedScreen() {
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const isBosnian = language === 'bs';

  const [activeTab, setActiveTab] = useState<SavedTabKey>('venues');
  const [savedVenues, setSavedVenues] = useState<SavedVenue[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [badges, setBadges] = useState<SavedBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const loadCurrentTab = useCallback(async () => {
    setIsLoading(true);

    try {
      if (activeTab === 'venues') {
        const result = await loadSavedVenues(language);
        setIsSignedIn(result.isSignedIn);
        setSavedVenues(result.venues);
        return;
      }

      if (activeTab === 'events') {
        setSavedEvents(await loadSavedEvents());
        return;
      }

      setBadges(await loadSavedBadges());
    } catch (error) {
      console.error('Error loading saved items:', error);

      if (activeTab === 'venues') {
        setSavedVenues([]);
      } else if (activeTab === 'events') {
        setSavedEvents([]);
      } else {
        setBadges([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, language]);

  useEffect(() => {
    void loadCurrentTab();
  }, [loadCurrentTab]);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges(() => {
      void loadCurrentTab();
    });

    return unsubscribe;
  }, [loadCurrentTab]);

  const handleRemoveVenue = useCallback(async (venueId: string) => {
    try {
      await removeSavedVenue(venueId);
      setSavedVenues((current) => current.filter((venue) => venue.id !== venueId));
    } catch (error) {
      console.error('Error removing venue:', error);

      if (isFavoritesAuthRequiredError(error)) {
        setIsSignedIn(false);
        Alert.alert('Sign in required', 'Please sign in from Profile to manage saved venues.');
      }
    }
  }, []);

  const handleRemoveEvent = useCallback(async (eventId: string) => {
    try {
      await removeSavedEvent(eventId);
      setSavedEvents((current) => current.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error('Error removing event:', error);
    }
  }, []);

  const handleVenueTap = useCallback(
    (venueId: string) => {
      router.push(`/venue/${venueId}`);
    },
    [router]
  );

  const handleEventTap = useCallback(
    (eventId: string) => {
      router.push(`/event/${eventId}`);
    },
    [router]
  );

  const emptyState = useMemo(() => {
    const isVenuesTab = activeTab === 'venues';
    const isEventsTab = activeTab === 'events';
    const isSignedOutVenuesState = isVenuesTab && !isSignedIn;

    return {
      buttonRoute: isVenuesTab
        ? isSignedOutVenuesState
          ? '/(tabs)/profile'
          : '/(tabs)/explore'
        : isEventsTab
          ? '/(tabs)/tonight'
          : '/(tabs)/explore',
      buttonText: isVenuesTab
        ? isSignedOutVenuesState
          ? 'Otvori Profil'
          : 'Istraži mjesta'
        : isEventsTab
          ? 'Pogledaj događaje'
          : 'Istraži grad',
      emoji: isVenuesTab ? '❤️' : isEventsTab ? '🎟️' : '🏆',
      subtitle: isVenuesTab
        ? isSignedOutVenuesState
          ? 'Otvori Profil i prijavi se da bi favoriti bili sačuvani na svim uređajima.'
          : 'Sačuvaj svoja omiljena mjesta da ih lako pronađeš kasnije.'
        : isEventsTab
          ? 'Sačuvaj događaje koji te zanimaju.'
          : 'Osvoji bedževe kroz aktivnost u aplikaciji.',
      title: isVenuesTab
        ? isSignedOutVenuesState
          ? 'Prijavi se da sačuvaš mjesta'
          : 'Nema sačuvanih mjesta'
        : isEventsTab
          ? 'Nema sačuvanih događaja'
          : 'Nema bedževa',
    };
  }, [activeTab, isSignedIn]);

  const content = (() => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      );
    }

    if (activeTab === 'venues') {
      if (savedVenues.length === 0) {
        return (
          <SavedEmptyState
            accentColor={colors.accent}
            buttonText={emptyState.buttonText}
            emoji={emptyState.emoji}
            onPress={() => router.push(emptyState.buttonRoute as any)}
            subtitle={emptyState.subtitle}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            title={emptyState.title}
          />
        );
      }

      return (
        <View style={styles.cardsContainer}>
          {savedVenues.map((venue) => (
            <SavedVenueCard
              key={venue.id}
              accentColor={colors.accent}
              backgroundColor={colors.background}
              cardColor={colors.card}
              getPriceLevelDisplay={getSavedPriceLevelDisplay}
              onDelete={handleRemoveVenue}
              onPress={handleVenueTap}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              venue={venue}
            />
          ))}
        </View>
      );
    }

    if (activeTab === 'events') {
      if (savedEvents.length === 0) {
        return (
          <SavedEmptyState
            accentColor={colors.accent}
            buttonText={emptyState.buttonText}
            emoji={emptyState.emoji}
            onPress={() => router.push(emptyState.buttonRoute as any)}
            subtitle={emptyState.subtitle}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            title={emptyState.title}
          />
        );
      }

      return (
        <View style={styles.cardsContainer}>
          {savedEvents.map((event) => (
            <SavedEventCard
              key={event.id}
              accentColor={colors.accent}
              cardColor={colors.card}
              dateDisplay={formatSavedEventDate(event.start_datetime, t('at'))}
              event={event}
              eventTitle={isBosnian ? event.title_bs : event.title_en || event.title_bs}
              onDelete={handleRemoveEvent}
              onPress={handleEventTap}
              priceDisplay={event.price_bam ? `${event.price_bam} KM` : t('free')}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
              venueName={event.venues?.name || event.location_name || ''}
            />
          ))}
        </View>
      );
    }

    if (badges.length === 0) {
      return (
        <SavedEmptyState
          accentColor={colors.accent}
          buttonText={emptyState.buttonText}
          emoji={emptyState.emoji}
          onPress={() => router.push(emptyState.buttonRoute as any)}
          subtitle={emptyState.subtitle}
          textColor={colors.text}
          textSecondaryColor={colors.textSecondary}
          title={emptyState.title}
        />
      );
    }

    return (
      <View style={styles.badgesGrid}>
        {badges.map((badge) => {
          const isEarned = DEMO_EARNED_BADGES.includes(badge.badge_key);

          return (
            <SavedBadgeCard
              key={badge.id}
              accentColor={colors.accent}
              backgroundColor={colors.background}
              badge={badge}
              badgeName={isBosnian ? badge.name_bs : badge.name_en}
              earnedDate={formatSavedBadgeDate(new Date().toISOString())}
              isEarned={isEarned}
              progress={getSavedBadgeProgress(badge.badge_key)}
              textColor={colors.text}
              textSecondaryColor={colors.textSecondary}
            />
          );
        })}
      </View>
    );
  })();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      <SavedTabs
        activeTab={activeTab}
        accentColor={colors.accent}
        onSelectTab={setActiveTab}
        textSecondaryColor={colors.textSecondary}
      />
      <ScrollView style={styles.content}>{content}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
