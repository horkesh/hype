import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { fetchSurprise } from '@/utils/ai/surpriseMe';
import type { SurprisePlan } from '@/utils/ai/surpriseMe';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

interface HomeSurpriseMeProps {
  language: string;
  tasteMoods?: string[];
}

export function HomeSurpriseMe({ language, tasteMoods = [] }: HomeSurpriseMeProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [plan, setPlan] = useState<SurprisePlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(48);

  const handlePress = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      expandHeight.value = withSpring(48, { damping: 15 });
      return;
    }
    setLoading(true);
    try {
      const result = await fetchSurprise(tasteMoods, language);
      if (result) {
        setPlan(result);
        setExpanded(true);
        expandHeight.value = withSpring(200 + (result.stops.length * 60), { damping: 15 });
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [expanded, tasteMoods, language]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    height: expandHeight.value,
    overflow: 'hidden',
  }));

  return (
    <Animated.View style={containerAnimStyle}>
      <GlassContainer glowColor="#D4A056" style={styles.container}>
        <TouchableOpacity onPress={handlePress} style={styles.header} activeOpacity={0.8}>
          <Text style={styles.sparkle}>{'\u2726'}</Text>
          <Text style={styles.title}>
            {language === 'bs' ? 'Iznenadi me' : 'Surprise me'}
          </Text>
          {loading && <ActivityIndicator size="small" color="#D4A056" />}
        </TouchableOpacity>
        {expanded && plan && (
          <View style={styles.planContent}>
            <Text style={styles.tagline}>
              {language === 'bs' ? plan.tagline_bs : plan.tagline_en}
            </Text>
            {plan.stops.map((stop, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stopRow}
                onPress={() => { if (stop.venue?.id) router.push(`/venue/${stop.venue.id}`); }}
              >
                <Text style={styles.stopTime}>{stop.time}</Text>
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopVenue, { color: colors.text }]}>{stop.venue_name}</Text>
                  <Text style={styles.stopPitch}>
                    {language === 'bs' ? stop.pitch_bs : stop.pitch_en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </GlassContainer>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sparkle: { fontSize: 16, color: '#D4A056' },
  title: { fontSize: 15, fontWeight: '700', color: '#FAFAF8', fontFamily: 'DMSans_700Bold', flex: 1 },
  planContent: { marginTop: 12 },
  tagline: { fontSize: 13, color: '#D4A056', fontFamily: 'DMSans_500Medium', marginBottom: 10 },
  stopRow: { flexDirection: 'row', marginBottom: 8, gap: 10 },
  stopTime: { fontSize: 13, color: '#D4A056', fontFamily: 'DMSans_700Bold', width: 40 },
  stopInfo: { flex: 1 },
  stopVenue: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  stopPitch: { fontSize: 12, color: '#A0A0A0', fontFamily: 'DMSans_400Regular', marginTop: 2 },
});
