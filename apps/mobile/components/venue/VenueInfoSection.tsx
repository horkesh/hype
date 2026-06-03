import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { VenueDetailVenue } from '@/utils/venueDetailScreen';

interface VenueInfoSectionProps {
  venue: VenueDetailVenue;
  description: string;
  colors: {
    text: string;
    textSecondary: string;
  };
  hiddenGemLabel: string;
  locationLabel: string;
}

export function VenueInfoSection({
  venue,
  description,
  colors,
  hiddenGemLabel,
  locationLabel,
}: VenueInfoSectionProps) {
  return (
    <View style={styles.infoTab}>
      <Text style={[styles.description, { color: colors.text }]}>{description}</Text>

      {venue.is_hidden_gem && venue.insider_tip ? (
        <View style={styles.hiddenGemSection}>
          <GlassBadge label={`\ud83d\udd75\ufe0f ${hiddenGemLabel}`} variant="accent" size="md" />
          <GlassContainer borderRadius={16} style={styles.insiderTipCard}>
            <Text style={[styles.insiderTip, { color: colors.text }]}>{venue.insider_tip}</Text>
          </GlassContainer>
        </View>
      ) : null}

      <View style={styles.contactInfo}>
        <View style={styles.contactRow}>
          <IconSymbol
            ios_icon_name="location.fill"
            android_material_icon_name="location-on"
            size={20}
            color={'#8E2DE2'}
          />
          <View style={styles.contactTextWrap}>
            <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>
              {locationLabel}
            </Text>
            <Text style={[styles.contactText, { color: colors.text }]}>{venue.address}</Text>
          </View>
        </View>

        {venue.phone ? (
          <View style={styles.contactRow}>
            <IconSymbol
              ios_icon_name="phone.fill"
              android_material_icon_name="phone"
              size={20}
              color={'#8E2DE2'}
            />
            <Text style={[styles.contactText, { color: colors.text }]}>{venue.phone}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoTab: {
    gap: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  hiddenGemSection: {
    gap: 8,
  },
  insiderTipCard: {
    padding: 12,
  },
  insiderTip: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  contactInfo: {
    gap: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactTextWrap: {
    flex: 1,
    gap: 2,
  },
  contactLabel: {
    fontSize: 13,
  },
  contactText: {
    fontSize: 16,
    flex: 1,
  },
});
