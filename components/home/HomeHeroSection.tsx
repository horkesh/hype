import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedCard } from '@/components/AnimatedCard';

interface HomeHeroSectionProps {
  title: string;
  subtitle: string;
}

export function HomeHeroSection({ title, subtitle }: HomeHeroSectionProps) {
  return (
    <AnimatedCard style={styles.heroCard}>
      <LinearGradient
        colors={['#D4A056', '#B8894A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroGradient}
      >
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroSubtitle}>{subtitle}</Text>
      </LinearGradient>
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroGradient: {
    padding: 24,
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
    fontFamily: 'DMSans_400Regular',
  },
});
