import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { PoweredByTelemach } from '@/components/telemach/PoweredByTelemach';
import { openTelemachEon, telemach } from '@/styles/telemach';

type Lang = 'bs' | 'en';

interface TelemachPartnerCardProps {
  language: Lang;
}

const PERKS: Record<Lang, { icon: keyof typeof MaterialIcons.glyphMap; label: string }[]> = {
  bs: [
    { icon: 'confirmation-number', label: 'Preskoči red u partner klubovima' },
    { icon: 'local-offer', label: 'Ekskluzivni popusti za pretplatnike' },
    { icon: 'bolt', label: 'Telemach 5G širom Sarajeva' },
  ],
  en: [
    { icon: 'confirmation-number', label: 'Skip the line at partner clubs' },
    { icon: 'local-offer', label: 'Exclusive subscriber discounts' },
    { icon: 'bolt', label: 'Telemach 5G across Sarajevo' },
  ],
};

/** "Look × Telemach" partnership card for the Profile screen. */
export function TelemachPartnerCard({ language }: TelemachPartnerCardProps): React.ReactElement {
  const heading = language === 'bs' ? 'Look × Telemach' : 'Look × Telemach';
  const blurb =
    language === 'bs'
      ? 'Tvoj izlazak, pokreće Telemach. Pretplatnici otključavaju perks u Looku.'
      : 'Your night out, powered by Telemach. Subscribers unlock perks inside Look.';

  return (
    <TouchableOpacity
      style={styles.wrap}
      activeOpacity={0.9}
      onPress={openTelemachEon}
      accessibilityRole="link"
      accessibilityLabel={heading}
    >
      <LinearGradient
        colors={telemach.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>{heading}</Text>
          <PoweredByTelemach variant="compact" tone="light" />
        </View>
        <Text style={styles.blurb}>{blurb}</Text>

        <View style={styles.perks}>
          {PERKS[language].map((perk) => (
            <View key={perk.label} style={styles.perkRow}>
              <View style={styles.perkIcon}>
                <MaterialIcons name={perk.icon} size={16} color={telemach.onPurple} />
              </View>
              <Text style={styles.perkText}>{perk.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  card: {
    borderRadius: 24,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heading: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: telemach.onPurple,
  },
  blurb: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: telemach.onPurpleDim,
    marginTop: 8,
  },
  perks: {
    marginTop: 16,
    gap: 10,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  perkIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: telemach.onPurple,
  },
});
