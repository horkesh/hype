import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SeriesDetailActionsProps {
  colors: {
    card: string;
    text: string;
    accent: string;
  };
  labels: {
    website: string;
    tickets: string;
    save: string;
    saved: string;
  };
  hasWebsite: boolean;
  hasTickets: boolean;
  isSaved: boolean;
  onWebsitePress: () => void;
  onTicketPress: () => void;
  onSavePress: () => void;
}

export function SeriesDetailActions({
  colors,
  labels,
  hasWebsite,
  hasTickets,
  isSaved,
  onWebsitePress,
  onTicketPress,
  onSavePress,
}: SeriesDetailActionsProps) {
  return (
    <>
      <View style={styles.linksRow}>
        {hasWebsite ? (
          <TouchableOpacity
            style={[
              styles.linkButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.accent,
              },
            ]}
            onPress={onWebsitePress}
          >
            <Text style={[styles.linkButtonText, { color: colors.accent }]}>
              {'\ud83c\udf10'} {labels.website}
            </Text>
          </TouchableOpacity>
        ) : null}

        {hasTickets ? (
          <TouchableOpacity
            style={[styles.linkButton, { backgroundColor: colors.accent }]}
            onPress={onTicketPress}
          >
            <Text style={styles.linkButtonTextWhite}>
              {'\ud83c\udf9f\ufe0f'} {labels.tickets}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: isSaved ? '#10B981' : colors.card }]}
        onPress={onSavePress}
      >
        <Text style={[styles.saveButtonText, { color: isSaved ? '#FFFFFF' : colors.text }]}>
          {'\u2764\ufe0f'} {isSaved ? labels.saved : labels.save}
        </Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  linksRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  linkButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  linkButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkButtonTextWhite: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
