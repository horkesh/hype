import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SavedBadgeCardModel } from '@/utils/savedContent';

interface SavedBadgeCardProps {
  accentColor: string;
  backgroundColor: string;
  badge: SavedBadgeCardModel;
  textColor: string;
  textSecondaryColor: string;
}

export function SavedBadgeCard({
  accentColor,
  backgroundColor,
  badge,
  textColor,
  textSecondaryColor,
}: SavedBadgeCardProps) {
  const progressPercent = (badge.progress.current / badge.progress.total) * 100;

  return (
    <View
      style={[
        styles.badgeCard,
        {
          backgroundColor: badge.isEarned ? '#FFFFFF' : backgroundColor,
          opacity: badge.isEarned ? 1 : 0.6,
        },
      ]}
    >
      <Text style={styles.badgeIcon}>{badge.icon}</Text>
      <Text style={[styles.badgeName, { color: textColor }]} numberOfLines={1}>
        {badge.badgeName}
      </Text>
      {badge.isEarned ? (
        <View style={styles.earnedBadge}>
          <Text style={[styles.earnedText, { color: accentColor }]}>Earned</Text>
          <Text style={[styles.earnedDate, { color: textSecondaryColor }]}>{badge.earnedDate}</Text>
        </View>
      ) : (
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: '#FFFFFF' }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: accentColor, width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: textSecondaryColor }]}>
            {badge.progress.current}
            <Text style={styles.progressSeparator}>/</Text>
            {badge.progress.total}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badgeCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  earnedBadge: {
    alignItems: 'center',
  },
  earnedText: {
    fontSize: 11,
    fontWeight: '600',
  },
  earnedDate: {
    fontSize: 10,
    marginTop: 2,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 10,
    fontWeight: '600',
  },
  progressSeparator: {
    fontWeight: '400',
  },
});
