import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { resolveImageSource } from '@/utils/imageSource';
import { Event } from '@/utils/tonightScreen';

interface TonightEventCardProps {
  cardColor: string;
  event: Event;
  eventMetaSeparator: string;
  eventTime: string;
  eventTitle: string;
  isSelected: boolean;
  onOpenTicket: (url: string) => void;
  onPress: () => void;
  onToggleSelection: (eventId: string) => void;
  priceText: string;
  showSelectionControls: boolean;
  textColor: string;
  textSecondaryColor: string;
  ticketButtonText: string;
  urgencyBadge: { label: string; color: string } | null;
  venueName: string;
}

export function TonightEventCard({
  cardColor,
  event,
  eventMetaSeparator,
  eventTime,
  eventTitle,
  isSelected,
  onOpenTicket,
  onPress,
  onToggleSelection,
  priceText,
  showSelectionControls,
  textColor,
  textSecondaryColor,
  ticketButtonText,
  urgencyBadge,
  venueName,
}: TonightEventCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.eventCard,
        { backgroundColor: cardColor },
        isSelected && styles.selectedCard,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {event.cover_image_url ? (
        <Image
          source={resolveImageSource(event.cover_image_url)}
          style={styles.eventImage}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={['#D4A056', '#B8894A']}
          style={styles.eventImage}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}

      <View style={styles.eventContent}>
        <View style={styles.badgeRow}>
          {urgencyBadge ? (
            <View style={[styles.badge, { backgroundColor: urgencyBadge.color }]}>
              <Text style={styles.badgeText}>{urgencyBadge.label}</Text>
            </View>
          ) : null}
          <View style={[styles.badge, styles.priceBadge]}>
            <Text style={[styles.badgeText, { color: textColor }]}>{priceText}</Text>
          </View>
        </View>

        <Text style={[styles.eventTitle, { color: textColor }]} numberOfLines={2}>
          {eventTitle}
        </Text>

        <View style={styles.eventMeta}>
          <Text style={[styles.eventMetaText, { color: textSecondaryColor }]}>
            {eventTime}
          </Text>
          {venueName ? (
            <>
              <Text style={[styles.eventMetaText, { color: textSecondaryColor }]}>
                {eventMetaSeparator}
              </Text>
              <Text style={[styles.eventMetaText, { color: textSecondaryColor }]} numberOfLines={1}>
                {venueName}
              </Text>
            </>
          ) : null}
        </View>

        <View style={styles.eventActions}>
          {event.ticket_url ? (
            <TouchableOpacity
              style={styles.ticketButton}
              onPress={() => onOpenTicket(event.ticket_url as string)}
            >
              <Text style={styles.ticketButtonText}>{ticketButtonText}</Text>
            </TouchableOpacity>
          ) : null}

          {showSelectionControls ? (
            <TouchableOpacity
              style={[
                styles.voteSelectButton,
                { backgroundColor: isSelected ? '#D4A056' : cardColor },
              ]}
              onPress={() => onToggleSelection(event.id)}
            >
              <Text style={[styles.voteSelectButtonText, { color: isSelected ? '#FFFFFF' : '#D4A056' }]}>
                {isSelected ? '\u2713' : '+'}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedCard: {
    borderWidth: 3,
    borderColor: '#D4A056',
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  priceBadge: {
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventMetaText: {
    fontSize: 14,
  },
  eventActions: {
    flexDirection: 'row',
    gap: 8,
  },
  ticketButton: {
    backgroundColor: '#D4A056',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    flex: 1,
    alignItems: 'center',
  },
  ticketButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  voteSelectButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4A056',
  },
  voteSelectButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
