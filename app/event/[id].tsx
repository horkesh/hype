import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { EventDetailHero } from '@/components/event/EventDetailHero';
import { EventPurchaseSection } from '@/components/event/EventPurchaseSection';
import { EventVenueAndBadges } from '@/components/event/EventVenueAndBadges';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import {
  loadEventDetail,
  loadEventSavedState,
  toggleEventSavedState,
} from '@/utils/eventDetailData';
import {
  EventDetailEvent,
  getEventCategoryEmoji,
  getEventDetailDescription,
  getEventDetailTitle,
  getEventMoodEmoji,
  getEventPriceDisplay,
  getEventTicketButtonText,
  getEventVenueName,
  isEventFree,
  formatEventDetailDateTime,
} from '@/utils/eventDetailScreen';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, language } = useApp();
  const { colors } = useTheme();
  const router = useRouter();

  const [event, setEvent] = useState<EventDetailEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    let isCancelled = false;

    setLoading(true);
    setEvent(null);

    (async () => {
      try {
        const [nextEvent, nextSaved] = await Promise.all([
          loadEventDetail(id),
          loadEventSavedState(id),
        ]);

        if (isCancelled) {
          return;
        }

        setEvent(nextEvent);
        setIsSaved(nextSaved);
      } catch (error) {
        console.error('Error loading event detail:', error);
        if (!isCancelled) {
          setEvent(null);
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
        <Stack.Screen options={{ title: t('eventDetails'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Stack.Screen options={{ title: t('eventDetails'), headerShown: true }} />
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{t('error')}</Text>
        </View>
      </>
    );
  }

  const eventTitle = getEventDetailTitle(event, language);
  const eventDescription = getEventDetailDescription(event, language);
  const venueName = getEventVenueName(event);
  const formattedDateTime = formatEventDetailDateTime(event.start_datetime, t('at'));
  const isFree = isEventFree(event.price_bam);
  const priceDisplay = getEventPriceDisplay(event.price_bam, language);
  const ticketButtonText = getEventTicketButtonText(event.ticket_url, language);

  const handleVenueTap = () => {
    if (event.venue_id) {
      router.push(`/venue/${event.venue_id}`);
    }
  };

  const handleTicketPress = async () => {
    if (!event.ticket_url) {
      return;
    }

    try {
      await Linking.openURL(event.ticket_url);
    } catch (error) {
      console.error('Error opening ticket URL:', error);
    }
  };

  const handleToggleSave = async () => {
    if (!id) {
      return;
    }

    try {
      setIsSaved(await toggleEventSavedState(id));
    } catch (error) {
      console.error('Error toggling event save state:', error);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: eventTitle, headerShown: true }} />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <EventDetailHero
          imageSource={event.cover_image_url}
          title={eventTitle}
          formattedDateTime={formattedDateTime}
          colors={colors}
        />

        <View style={styles.content}>
          <EventVenueAndBadges
            venueName={venueName}
            venueEnabled={Boolean(event.venue_id)}
            onVenuePress={handleVenueTap}
            venueLabel={t('venue')}
            category={event.category}
            categoryEmoji={getEventCategoryEmoji(event.category)}
            moods={event.moods || []}
            getMoodEmoji={getEventMoodEmoji}
            colors={colors}
          />

          <EventPurchaseSection
            isFree={isFree}
            priceLabel={t('price')}
            priceDisplay={priceDisplay}
            ticketButtonText={ticketButtonText}
            showTicketButton={Boolean(event.ticket_url)}
            onTicketPress={handleTicketPress}
            colors={colors}
            language={language}
          />

          {eventDescription ? (
            <View style={styles.descriptionSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('description')}
              </Text>
              <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
                {eventDescription}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isSaved ? '#10B981' : colors.card }]}
            onPress={handleToggleSave}
          >
            <Text style={[styles.saveButtonText, { color: isSaved ? '#FFFFFF' : colors.text }]}>
              {'\u2764\ufe0f'} {isSaved ? t('eventSaved') : t('saveEvent')}
            </Text>
          </TouchableOpacity>
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
    padding: 20,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  saveButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 28,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
