import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

import { PoweredByTelemach } from '@/components/telemach/PoweredByTelemach';
import { telemach } from '@/styles/telemach';

type Lang = 'bs' | 'en';

interface TelemachPackage {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  name: string;
  tagline: Record<Lang, string>;
  spec: Record<Lang, string>;
  price: string;
  per: Record<Lang, string>;
  perks: Record<Lang, string[]>;
  gradient: readonly [string, string];
}

const PACKAGES: TelemachPackage[] = [
  {
    id: 'fiber',
    icon: 'wifi',
    name: 'EON Internet',
    tagline: { bs: 'Najbrži internet u BiH', en: 'Fastest internet in BiH' },
    spec: { bs: 'do 1 Gbps optika', en: 'up to 1 Gbps fiber' },
    price: '39 KM',
    per: { bs: '/mj', en: '/mo' },
    perks: {
      bs: ['Optika u tvom kraju', 'WiFi 6 ruter uključen'],
      en: ['Fiber in your neighborhood', 'WiFi 6 router included'],
    },
    gradient: telemach.gradient,
  },
  {
    id: 'mobile',
    icon: 'signal-cellular-alt',
    name: 'EON Mobile L',
    tagline: { bs: 'Ostani spojen/a večeras', en: 'Stay connected tonight' },
    spec: { bs: '150 GB + neograničeni pozivi', en: '150 GB + unlimited calls' },
    price: '25 KM',
    per: { bs: '/mj', en: '/mo' },
    perks: {
      bs: ['Regionalni roaming: BA·HR·RS·ME', '5G mreža'],
      en: ['Regional roaming: BA·HR·RS·ME', '5G network'],
    },
    gradient: telemach.gradientVivid,
  },
];

interface TelemachPackagesSectionProps {
  language: Lang;
}

export function TelemachPackagesSection({
  language,
}: TelemachPackagesSectionProps): React.ReactElement {
  const title = language === 'bs' ? 'Ostani spojen/a večeras' : 'Stay connected tonight';
  const subtitle =
    language === 'bs'
      ? 'Telemach paketi za ekipu u pokretu'
      : 'Telemach plans for a city on the move';
  const cta = language === 'bs' ? 'Saznaj više' : 'Learn more';

  return (
    <View>
      <View style={styles.header}>
        <PoweredByTelemach variant="compact" tone="light" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {PACKAGES.map((pkg) => (
          <View key={pkg.id} style={styles.card}>
            <LinearGradient
              colors={pkg.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <MaterialIcons name={pkg.icon} size={22} color={telemach.onPurple} />
              </View>
              <Text style={styles.tagline}>{pkg.tagline[language]}</Text>
            </View>

            <Text style={styles.name}>{pkg.name}</Text>
            <Text style={styles.spec}>{pkg.spec[language]}</Text>

            <View style={styles.perks}>
              {pkg.perks[language].map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <MaterialIcons name="check-circle" size={14} color={telemach.onPurple} />
                  <Text style={styles.perkText}>{perk}</Text>
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{pkg.price}</Text>
                <Text style={styles.per}>{pkg.per[language]}</Text>
              </View>
              <TouchableOpacity style={styles.ctaButton} activeOpacity={0.85}>
                <Text style={styles.ctaText}>{cta}</Text>
                <MaterialIcons name="arrow-forward" size={16} color={telemach.purpleDeep} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  title: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 24,
    color: '#F5F5F5',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#A0A0A0',
    marginTop: 2,
  },
  row: {
    paddingHorizontal: 16,
    gap: 12,
  },
  card: {
    width: 270,
    borderRadius: 24,
    padding: 18,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagline: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: telemach.onPurpleDim,
  },
  name: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 26,
    color: telemach.onPurple,
    marginTop: 18,
  },
  spec: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: telemach.onPurple,
    marginTop: 4,
  },
  perks: {
    marginTop: 14,
    gap: 6,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  perkText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12.5,
    color: telemach.onPurpleDim,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    fontWeight: '700',
    color: telemach.onPurple,
  },
  per: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: telemach.onPurpleDim,
    marginLeft: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  ctaText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: telemach.purpleDeep,
  },
});
