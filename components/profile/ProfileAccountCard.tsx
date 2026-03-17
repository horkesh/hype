import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';
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
  signOutLabel: string;
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
  signOutLabel,
  textColor,
  textSecondaryColor,
}: ProfileAccountCardProps) {
  return (
    <GlassContainer borderRadius={16} style={styles.card}>
      <Text style={[styles.emailText, { color: textColor }]}>{email}</Text>

      <View style={styles.badgesSection}>
        <View style={styles.badgeCountRow}>
          <Text style={[styles.badgeCountNumber, { color: accentColor }]}>{badgeCountNumber}</Text>
          <Text style={[styles.badgeCountLabel, { color: textSecondaryColor }]}>{badgeCountLabel}</Text>
        </View>
        <View style={styles.topBadgesRow}>
          {badges.slice(0, 3).map((badge, index) => (
            <GlassContainer
              key={`${badge.name_en}-${index}`}
              borderRadius={24}
              style={styles.topBadge}
            >
              <Text style={styles.topBadgeIcon}>{badge.icon}</Text>
            </GlassContainer>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={onSignOut}
        style={[styles.signOutButton, { borderColor: accentColor }]}
      >
        <Text style={[styles.signOutButtonText, { color: accentColor }]}>{signOutLabel}</Text>
      </TouchableOpacity>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
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
    justifyContent: 'center',
    alignItems: 'center',
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
