import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { fetchCityPulse } from '@/utils/ai/cityPulse';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { GlassBadge } from '@/components/glass/GlassBadge';

interface HomeCityPulseProps {
  language: string;
  weather?: { temp: number; condition: string } | null;
}

export function HomeCityPulse({ language, weather }: HomeCityPulseProps) {
  const [pulse, setPulse] = useState<{ pulse_bs: string; pulse_en: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const data = await fetchCityPulse({ weather: weather ?? null }).catch(() => null);
      if (mounted) {
        setPulse(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [weather]);

  if (loading) {
    return (
      <GlassContainer style={styles.container}>
        <SkeletonLoader height={14} width="90%" style={{ marginBottom: 6 }} />
        <SkeletonLoader height={14} width="70%" />
      </GlassContainer>
    );
  }

  if (!pulse) return null;
  const text = language === 'bs' ? pulse.pulse_bs : pulse.pulse_en;

  return (
    <GlassContainer style={styles.container}>
      <View style={styles.header}>
        <GlassBadge label="City Pulse" variant="accent" size="sm" />
        <Text style={styles.aiLabel}>AI</Text>
      </View>
      <Text style={styles.pulseText}>{text}</Text>
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, marginBottom: 8 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  aiLabel: { fontSize: 10, fontWeight: '700', color: '#8E2DE2', fontFamily: 'DMSans_700Bold' },
  pulseText: { fontSize: 14, color: '#F5F5F5', lineHeight: 20, fontFamily: 'DMSans_400Regular' },
});
