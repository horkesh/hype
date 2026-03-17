import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { designTokens } from '@/styles/designTokens';

interface VenueCardBackProps {
  name: string;
  address?: string;
  hours?: string;
  priceLevel?: number;
  distance?: string;
  description?: string;
  onNavigate?: () => void;
  onCall?: () => void;
  onSave?: () => void;
}

export function VenueCardBack({
  name,
  address,
  hours,
  priceLevel,
  distance,
  description,
  onNavigate,
  onCall,
  onSave,
}: VenueCardBackProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
      {address && <Text style={[styles.detail, { color: colors.textSecondary }]}>{address}</Text>}
      {hours && <Text style={[styles.detail, { color: colors.textSecondary }]}>{hours}</Text>}
      {priceLevel && (
        <Text style={[styles.detail, { color: colors.accent }]}>
          {'$'.repeat(priceLevel)}
        </Text>
      )}
      {distance && <Text style={[styles.detail, { color: colors.textSecondary }]}>{distance}</Text>}
      {description && (
        <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={3}>
          {description}
        </Text>
      )}
      <View style={styles.actions}>
        {onNavigate && (
          <TouchableOpacity onPress={onNavigate} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 16 }}>📍</Text>
          </TouchableOpacity>
        )}
        {onCall && (
          <TouchableOpacity onPress={onCall} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontSize: 16 }}>📞</Text>
          </TouchableOpacity>
        )}
        {onSave && (
          <TouchableOpacity onPress={onSave} style={[styles.actionBtn, { borderColor: colors.border }]}>
            <Text style={{ color: colors.accent, fontSize: 16 }}>♡</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    borderRadius: designTokens.radius.card,
    justifyContent: 'space-between',
  },
  title: { ...designTokens.typography.cardTitle, marginBottom: 8 },
  detail: { fontSize: 13, marginBottom: 4, fontFamily: 'DMSans_400Regular' },
  desc: { fontSize: 13, lineHeight: 18, marginTop: 8, fontFamily: 'DMSans_400Regular' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
