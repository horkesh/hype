import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VenueHoursSectionProps {
  colors: {
    card: string;
    text: string;
    textSecondary: string;
    accent: string;
  };
  isOpen: boolean;
  todayHours: string;
  showAllHours: boolean;
  onToggleShowAllHours: () => void;
  labels: {
    open: string;
    closed: string;
    hide: string;
    showAll: string;
  };
  hoursRows: { day: number; dayName: string; hoursText: string }[];
  hasOpeningHours: boolean;
}

export function VenueHoursSection({
  colors,
  isOpen,
  todayHours,
  showAllHours,
  onToggleShowAllHours,
  labels,
  hoursRows,
  hasOpeningHours,
}: VenueHoursSectionProps) {
  return (
    <>
      <View style={styles.statusSection}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isOpen ? '#4CAF50' : '#F44336' },
          ]}
        >
          <Text style={styles.statusBadgeText}>{isOpen ? labels.open : labels.closed}</Text>
        </View>
        <Text style={[styles.todayHours, { color: colors.textSecondary }]}>{todayHours}</Text>

        {hasOpeningHours ? (
          <TouchableOpacity onPress={onToggleShowAllHours}>
            <Text style={[styles.expandHours, { color: colors.accent }]}>
              {showAllHours ? labels.hide : labels.showAll}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {showAllHours && hasOpeningHours ? (
        <View style={[styles.fullHoursSection, { backgroundColor: colors.card }]}>
          {hoursRows.map((row) => (
            <View key={row.day} style={styles.hoursRow}>
              <Text style={[styles.dayName, { color: colors.text }]}>{row.dayName}</Text>
              <Text style={[styles.dayHours, { color: colors.textSecondary }]}>
                {row.hoursText}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  statusSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  todayHours: {
    fontSize: 16,
    marginBottom: 4,
  },
  expandHours: {
    fontSize: 14,
    fontWeight: '600',
  },
  fullHoursSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
  },
  dayHours: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
});
