import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { loadHeritageWalks, type HeritageWalk } from '@/utils/heritageWalkData';
import { getWalkTitle, getWalkSummary, getHeritageWalksLabel } from '@/utils/heritageWalkScreen';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { designTokens } from '@/styles/designTokens';
import type { HomeLanguage } from '@/utils/homeScreenContent';

interface Props {
  language: HomeLanguage;
  colors: { accent: string; card: string; text: string; textSecondary: string };
}

const WALK_ICONS: Record<string, string> = {
  'ottoman-sarajevo': 'mosque',
  'austro-hungarian-sarajevo': 'bank',
  'european-jerusalem': 'hands-pray',
};

export function HomeHeritageSection({ language, colors }: Props) {
  const [walks, setWalks] = useState<HeritageWalk[]>([]);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    loadHeritageWalks().then((data) => {
      if (mounted) setWalks(data);
    });
    return () => { mounted = false; };
  }, []);

  if (walks.length === 0) return null;

  const labels = getHeritageWalksLabel(language);

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{labels.title}</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{labels.subtitle}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
        {walks.map((walk) => (
          <TouchableOpacity
            key={walk.id}
            onPress={() => router.push(`/heritage/${walk.id}` as any)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={getWalkTitle(walk, language)}
          >
            <GlassContainer style={styles.card}>
              <MaterialCommunityIcons
                name={(WALK_ICONS[walk.slug] ?? 'walk') as any}
                size={28}
                color={colors.accent}
                style={styles.icon}
              />
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {getWalkTitle(walk, language)}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>
                {getWalkSummary(walk, language)}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Visit Sarajevo</Text>
              </View>
            </GlassContainer>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingLeft: 16, marginBottom: 8 },
  sectionTitle: {
    ...designTokens.typography.sectionHeader,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  rail: { paddingRight: 16 },
  card: {
    width: 200,
    padding: 16,
    marginRight: 12,
  },
  icon: { marginBottom: 8 },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(212,160,86,0.15)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    color: '#D4A056',
  },
});
