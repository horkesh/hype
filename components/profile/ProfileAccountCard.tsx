import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ProfileDemoBadge } from '@/utils/profileScreen';

interface ProfileAccountCardProps {
  accentColor: string;
  backgroundColor: string;
  badgeCountLabel: string;
  badgeCountNumber: number;
  badges: ProfileDemoBadge[];
  cardColor: string;
  email: string;
  onSignOut: () => void;
  textColor: string;
  textSecondaryColor: string;
}

export function ProfileAccountCard({
  accentColor,
  backgroundColor,
  badgeCountLabel,
  badgeCountNumber,
  badges,
  cardColor,
  email,
  onSignOut,
  textColor,
  textSecondaryColor,
}: ProfileAccountCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <Text style={[styles.emailText, { color: textColor }]}>{email}</Text>

      <View style={styles.badgesSection}>
        <View style={styles.badgeCountRow}>
          <Text style={[styles.badgeCountNumber, { color: accentColor }]}>{badgeCountNumber}</Text>
          <Text style={[styles.badgeCountLabel, { color: textSecondaryColor }]}>{badgeCountLabel}</Text>
        </View>
        <View style={styles.topBadgesRow}>
          {badges.slice(0, 3).map((badge, index) => (
            <View key={`${badge.name_en}-${index}`} style={[styles.topBadge, { backgroundColor }]}>
              <Text style={styles.topBadgeIcon}>{badge.icon}</Text>
            </View>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={onSignOut}
        style={[styles.signOutButton, { borderColor: accentColor }]}
      >
        <Text style={[styles.signOutButtonText, { color: accentColor }]}>Odjavi se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 16,
  },
  badgesSection: {
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  badgeCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  badgeCountNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  badgeCountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  topBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topBadgeIcon: {
    fontSize: 24,
  },
  signOutButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
