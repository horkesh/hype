import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTransportDirections, formatTransportDirection, type TransportDirection } from '@/utils/venueTransport';

interface Props {
  neighborhood: string | null;
  language: 'bs' | 'en';
  colors: { accent: string; text: string; textSecondary: string };
}

const MODE_ICONS: Record<string, string> = {
  tram: 'tram',
  bus: 'bus',
  trolleybus: 'bus-electric',
  walk: 'walk',
};

export function VenueTransportSection({ neighborhood, language, colors }: Props) {
  const directions = getTransportDirections(neighborhood);
  if (directions.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>
        {language === 'bs' ? 'Kako doći' : 'How to get here'}
      </Text>
      {directions.map((dir, i) => (
        <View key={i} style={styles.row}>
          <MaterialCommunityIcons
            name={MODE_ICONS[dir.mode] as any}
            size={18}
            color={colors.accent}
            style={styles.icon}
          />
          <Text style={[styles.dirText, { color: colors.textSecondary }]}>
            {formatTransportDirection(dir, language)}
          </Text>
        </View>
      ))}
      <Text style={styles.source}>
        {language === 'bs' ? 'Podaci: Visit Sarajevo' : 'Data: Visit Sarajevo'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 16, fontFamily: 'DMSans_700Bold', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  icon: { marginRight: 8, width: 24 },
  dirText: { fontSize: 14, fontFamily: 'DMSans_400Regular', flex: 1 },
  source: { fontSize: 11, fontFamily: 'DMSans_400Regular', color: 'rgba(255,255,255,0.3)', marginTop: 8, textAlign: 'right' },
});
