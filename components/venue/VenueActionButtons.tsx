import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface VenueActionButtonsProps {
  colors: {
    card: string;
    text: string;
    accent: string;
  };
  labels: {
    navigate: string;
    call: string;
    save: string;
    web: string;
    instagram: string;
    korpa: string;
    glovo: string;
  };
  hasPhone: boolean;
  hasWebsite: boolean;
  hasInstagram: boolean;
  isSaved: boolean;
  onNavigate: () => void;
  onPhone: () => void;
  onWebsite: () => void;
  onInstagram: () => void;
  onToggleSave: () => void;
  onOpenKorpa?: () => void;
  onOpenGlovo?: () => void;
}

export function VenueActionButtons({
  colors,
  labels,
  hasPhone,
  hasWebsite,
  hasInstagram,
  isSaved,
  onNavigate,
  onPhone,
  onWebsite,
  onInstagram,
  onToggleSave,
  onOpenKorpa,
  onOpenGlovo,
}: VenueActionButtonsProps) {
  return (
    <>
      <View style={styles.actionButtons}>
        <ActionButton
          label={labels.navigate}
          emoji={'\ud83d\udccd'}
          onPress={onNavigate}
          colors={colors}
        />

        {hasPhone ? (
          <ActionButton
            label={labels.call}
            emoji={'\ud83d\udcde'}
            onPress={onPhone}
            colors={colors}
          />
        ) : null}

        {hasWebsite ? (
          <ActionButton
            label={labels.web}
            emoji={'\ud83c\udf10'}
            onPress={onWebsite}
            colors={colors}
          />
        ) : null}

        {hasInstagram ? (
          <ActionButton
            label={labels.instagram}
            emoji={'\ud83d\udcf8'}
            onPress={onInstagram}
            colors={colors}
          />
        ) : null}

        <ActionButton
          label={labels.save}
          emoji={isSaved ? '\u2764\ufe0f' : '\ud83e\udd0d'}
          onPress={onToggleSave}
          colors={colors}
        />
      </View>

      {onOpenKorpa || onOpenGlovo ? (
        <View style={styles.deliveryButtons}>
          {onOpenKorpa ? (
            <TouchableOpacity
              style={[styles.deliveryButton, { backgroundColor: colors.accent }]}
              onPress={onOpenKorpa}
            >
              <Text style={styles.deliveryButtonText}>
                {'\ud83d\uded5'} {labels.korpa}
              </Text>
            </TouchableOpacity>
          ) : null}
          {onOpenGlovo ? (
            <TouchableOpacity
              style={[styles.deliveryButton, { backgroundColor: colors.accent }]}
              onPress={onOpenGlovo}
            >
              <Text style={styles.deliveryButtonText}>
                {'\ud83d\uded5'} {labels.glovo}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </>
  );
}

interface ActionButtonProps {
  colors: {
    card: string;
    text: string;
  };
  emoji: string;
  label: string;
  onPress: () => void;
}

function ActionButton({ colors, emoji, label, onPress }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <Text style={styles.actionButtonEmoji}>{emoji}</Text>
      <Text style={[styles.actionButtonText, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  actionButtonEmoji: {
    fontSize: 18,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  deliveryButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  deliveryButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  deliveryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
