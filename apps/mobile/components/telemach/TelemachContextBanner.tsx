import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { PoweredByTelemach } from '@/components/telemach/PoweredByTelemach';
import { openTelemachEon, telemach } from '@/styles/telemach';

type Lang = 'bs' | 'en';
type Context = 'venue' | 'event';

interface TelemachContextBannerProps {
  context: Context;
  language: Lang;
}

const COPY: Record<Context, { icon: keyof typeof MaterialIcons.glyphMap; title: Record<Lang, string>; subtitle: Record<Lang, string> }> = {
  venue: {
    icon: 'wifi-tethering',
    title: {
      bs: 'Telemach 5G te prati ovdje',
      en: 'Telemach 5G has you covered here',
    },
    subtitle: {
      bs: 'Pretplatnici: preskoči red i ekskluzivni popusti',
      en: 'Subscribers: skip the line & exclusive perks',
    },
  },
  event: {
    icon: 'live-tv',
    title: {
      bs: 'Gledaj uživo na EON-u',
      en: 'Watch it live on EON',
    },
    subtitle: {
      bs: 'Telemach 5G · perks za pretplatnike',
      en: 'Telemach 5G · perks for subscribers',
    },
  },
};

/** Slim co-branded banner shown on venue / event detail screens. */
export function TelemachContextBanner({
  context,
  language,
}: TelemachContextBannerProps): React.ReactElement {
  const copy = COPY[context];

  return (
    <TouchableOpacity
      style={styles.wrap}
      activeOpacity={0.9}
      onPress={openTelemachEon}
      accessibilityRole="link"
      accessibilityLabel={copy.title[language]}
    >
      <LinearGradient
        colors={telemach.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        <View style={styles.iconChip}>
          <MaterialIcons name={copy.icon} size={20} color={telemach.onPurple} />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>{copy.title[language]}</Text>
          <Text style={styles.subtitle}>{copy.subtitle[language]}</Text>
        </View>
        <PoweredByTelemach variant="compact" tone="light" wordmarkOnly />
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  iconChip: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    fontSize: 15,
    color: telemach.onPurple,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: telemach.onPurpleDim,
    marginTop: 2,
  },
});
