import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HypeHeader } from '@/components/HypeHeader';
import { SavedTabContent } from '@/components/saved/SavedTabContent';
import { SavedTabs } from '@/components/saved/SavedTabs';
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
  getSavedTabLabels,
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

  const tabs = useMemo(() => getSavedTabLabels(isBosnian), [isBosnian]);

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

  const handleRoutePress = useCallback(
    (route: '/(tabs)/profile' | '/(tabs)/explore' | '/(tabs)/tonight') => {
      router.push(route);
    },
    [router]
  );

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      <SavedTabs
        activeTab={activeTab}
        accentColor={colors.accent}
        onSelectTab={setActiveTab}
        tabs={tabs}
        textSecondaryColor={colors.textSecondary}
      />
      <SavedTabContent
        accentColor={colors.accent}
        activeTab={activeTab}
        backgroundColor={colors.background}
        badges={badges}
        cardColor={colors.card}
        eventAtLabel={t('at')}
        events={savedEvents}
        freeLabel={t('free')}
        isBosnian={isBosnian}
        isLoading={isLoading}
        isSignedIn={isSignedIn}
        textColor={colors.text}
        textSecondaryColor={colors.textSecondary}
        venues={savedVenues}
        onPressBadgeRoute={handleRoutePress}
        onPressEvent={handleEventTap}
        onPressVenue={handleVenueTap}
        onRemoveEvent={handleRemoveEvent}
        onRemoveVenue={handleRemoveVenue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
