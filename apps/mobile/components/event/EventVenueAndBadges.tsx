import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';

interface EventVenueAndBadgesProps {
  venueName: string;
  venueAddress?: string;
  venueEnabled: boolean;
  onVenuePress: () => void;
  venueLabel: string;
  dateTimeDisplay: string;
  whenLabel: string;
  priceDisplay: string;
  priceLabel: string;
  category: string;
  categoryEmoji: string;
  moods: string[];
  getMoodEmoji: (mood: string) => string;
  colors: {
    card: string;
    text: string;
    textSecondary: string;
  };
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  onPress,
  isLast,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
  onPress?: () => void;
  isLast?: boolean;
}) {
  const content = (
    <View style={[styles.infoRow, !isLast && styles.infoRowBorder]}>
      <MaterialIcons name={icon} size={20} color="#8E2DE2" style={styles.infoIcon} />
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

export function EventVenueAndBadges({
  venueName,
  venueAddress,
  venueEnabled,
  onVenuePress,
  venueLabel,
  dateTimeDisplay,
  whenLabel,
  priceDisplay,
  priceLabel,
  category,
  categoryEmoji,
  moods,
  getMoodEmoji,
  colors,
}: EventVenueAndBadgesProps) {
  return (
    <>
      {/* Badges row */}
      <View style={styles.badgesRow}>
        <GlassBadge label={`${categoryEmoji} ${category}`} variant="accent" size="md" />
      </View>

      {/* Structured info rows */}
      <View style={styles.infoContainer}>
        {venueName ? (
          <InfoRow
            icon="place"
            label={venueLabel.toUpperCase()}
            value={venueName}
            valueColor={venueEnabled ? '#8E2DE2' : colors.text}
            onPress={venueEnabled ? onVenuePress : undefined}
          />
        ) : null}

        {dateTimeDisplay ? (
          <InfoRow
            icon="event"
            label={whenLabel.toUpperCase()}
            value={dateTimeDisplay}
          />
        ) : null}

        <InfoRow
          icon="sell"
          label={priceLabel.toUpperCase()}
          value={priceDisplay}
          isLast
        />
      </View>

      {/* Mood badges */}
      {moods.length > 0 ? (
        <GlassContainer borderRadius={16} style={styles.moodBadgesContainer}>
          <View style={styles.moodBadges}>
            {moods.map((mood) => (
              <View key={mood} style={styles.moodBadge}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
                <Text style={[styles.moodText, { color: colors.text }]}>{mood}</Text>
              </View>
            ))}
          </View>
        </GlassContainer>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  infoIcon: {
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_500Medium',
    color: '#98989D',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    color: '#F5F5F5',
  },
  moodBadgesContainer: {
    padding: 10,
    marginBottom: 20,
  },
  moodBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  moodText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
});
