import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { VenueActionButtons } from '@/components/venue/VenueActionButtons';
import { VenueDetailHeader } from '@/components/venue/VenueDetailHeader';
import { VenueDetailTabs } from '@/components/venue/VenueDetailTabs';
import { VenueEventsSection } from '@/components/venue/VenueEventsSection';
import { VenueHoursSection } from '@/components/venue/VenueHoursSection';
import { VenueInfoSection } from '@/components/venue/VenueInfoSection';
import { VenueSpecialsSection } from '@/components/venue/VenueSpecialsSection';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { isFavoritesAuthRequiredError } from '@/utils/favorites';
import {
  loadVenueDailySpecials,
  loadVenueDetail,
  loadVenueEvents,
  loadVenueSavedState,
  toggleVenueSavedState,
} from '@/utils/venueDetailData';
import {
  VenueDetailEvent,
  VenueDetailSpecial,
  VenueDetailTabKey,
  VenueDetailVenue,
  getVenueDescription,
  getVenueDetailCopy,
  getVenueHoursRows,
  getVenueTodayHours,
  isVenueOpenNow,
} from '@/utils/venueDetailScreen';

export default function VenueDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useApp();
  const { colors } = useTheme();

  const [venue, setVenue] = useState<VenueDetailVenue | null>(null);
  const [events, setEvents] = useState<VenueDetailEvent[]>([]);
  const [dailySpecials, setDailySpecials] = useState<VenueDetailSpecial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VenueDetailTabKey>('info');
  const [showAllHours, setShowAllHours] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [specialsLoaded, setSpecialsLoaded] = useState(false);

  const copy = getVenueDetailCopy(language);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isCancelled = false;

    setLoading(true);
    setVenue(null);
    setEvents([]);
    setDailySpecials([]);
    setEventsLoaded(false);
    setSpecialsLoaded(false);
    setShowAllHours(false);

    (async () => {
      try {
        const [nextVenue, nextSaved] = await Promise.all([
          loadVenueDetail(id, language),
          loadVenueSavedState(id),
        ]);

        if (isCancelled) {
          return;
        }

        setVenue(nextVenue);
        setIsSaved(nextSaved);
      } catch (error) {
        console.error('Error loading venue detail:', error);
        if (!isCancelled) {
          setVenue(null);
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
  }, [id, language]);

  useEffect(() => {
    if (!venue || activeTab !== 'events' || eventsLoaded) {
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const nextEvents = await loadVenueEvents(venue.id);
        if (!isCancelled) {
          setEvents(nextEvents);
          setEventsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading venue events:', error);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, eventsLoaded, venue]);

  useEffect(() => {
    if (!venue || activeTab !== 'specials' || specialsLoaded) {
      return;
    }

    let isCancelled = false;

    (async () => {
      try {
        const nextSpecials = await loadVenueDailySpecials(venue.id, language);
        if (!isCancelled) {
          setDailySpecials(nextSpecials);
          setSpecialsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading venue specials:', error);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [activeTab, language, specialsLoaded, venue]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: copy.back }} />
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!venue) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: copy.back }} />
        <Text style={[styles.errorText, { color: colors.text }]}>{copy.notFound}</Text>
      </View>
    );
  }

  const isOpen = isVenueOpenNow(venue.opening_hours);
  const todayHours = getVenueTodayHours(venue.opening_hours, language);
  const hoursRows = getVenueHoursRows(venue.opening_hours, language);
  const description = getVenueDescription(venue, language);

  const handleToggleSave = async () => {
    if (!id) {
      return;
    }

    try {
      const nextSaved = await toggleVenueSavedState(id, isSaved);
      setIsSaved(nextSaved);
    } catch (error) {
      console.error('Error toggling save:', error);
      if (isFavoritesAuthRequiredError(error)) {
        Alert.alert(copy.signInRequiredTitle, copy.signInRequiredMessage);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: true, title: '', headerBackTitle: copy.back }} />

      <ScrollView style={styles.scrollView}>
        <VenueDetailHeader venue={venue} colors={colors} t={t} />

        <VenueHoursSection
          colors={colors}
          isOpen={isOpen}
          todayHours={todayHours}
          showAllHours={showAllHours}
          onToggleShowAllHours={() => setShowAllHours((current) => !current)}
          labels={copy}
          hoursRows={hoursRows}
          hasOpeningHours={Boolean(venue.opening_hours)}
        />

        <VenueActionButtons
          colors={colors}
          labels={copy}
          hasPhone={Boolean(venue.phone)}
          hasWebsite={Boolean(venue.website)}
          hasInstagram={Boolean(venue.instagram)}
          isSaved={isSaved}
          onNavigate={() =>
            openExternalUrl(`https://maps.google.com/?q=${venue.latitude},${venue.longitude}`)
          }
          onPhone={() => openExternalUrl(`tel:${venue.phone}`)}
          onWebsite={() => openExternalUrl(venue.website)}
          onInstagram={() => openExternalUrl(venue.instagram)}
          onToggleSave={handleToggleSave}
          onOpenKorpa={
            venue.delivery_korpa_url ? () => openExternalUrl(venue.delivery_korpa_url) : undefined
          }
          onOpenGlovo={
            venue.delivery_glovo_url ? () => openExternalUrl(venue.delivery_glovo_url) : undefined
          }
        />

        <VenueDetailTabs
          activeTab={activeTab}
          colors={colors}
          labels={copy}
          onSelectTab={setActiveTab}
        />

        <View style={styles.tabContent}>
          {activeTab === 'info' ? (
            <VenueInfoSection
              venue={venue}
              description={description}
              colors={colors}
              hiddenGemLabel={copy.hiddenGem}
              locationLabel={copy.location}
            />
          ) : null}

          {activeTab === 'events' ? (
            <VenueEventsSection
              events={events}
              language={language}
              colors={colors}
              emptyLabel={copy.noEvents}
              freeLabel={copy.free}
            />
          ) : null}

          {activeTab === 'specials' ? (
            <VenueSpecialsSection
              specials={dailySpecials}
              colors={colors}
              emptyLabel={copy.noSpecials}
              validLabel={copy.valid}
            />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

async function openExternalUrl(url: string | null | undefined): Promise<void> {
  if (!url) {
    return;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Error opening external URL:', error);
  }
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
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
});
