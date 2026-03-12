import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';
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
          <View style={[styles.hiddenGemBadge, { backgroundColor: '#FFF3E0' }]}>
            <Text style={styles.hiddenGemEmoji}>{'\ud83d\udd75\ufe0f'}</Text>
            <Text style={styles.hiddenGemText}>{hiddenGemLabel}</Text>
          </View>
          <View style={styles.insiderTipCard}>
            <Text style={[styles.insiderTip, { color: colors.text }]}>{venue.insider_tip}</Text>
          </View>
        </View>
      ) : null}

      <View style={styles.contactInfo}>
        <View style={styles.contactRow}>
          <IconSymbol
            ios_icon_name="location.fill"
            android_material_icon_name="location-on"
            size={20}
            color={'#D4A056'}
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
              color={'#D4A056'}
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
  hiddenGemBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  hiddenGemEmoji: {
    fontSize: 16,
  },
  hiddenGemText: {
    color: '#F57C00',
    fontSize: 14,
    fontWeight: '600',
  },
  insiderTipCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
    paddingLeft: 12,
    paddingVertical: 8,
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
