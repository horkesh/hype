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
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const expandHeight = useSharedValue(48);

  const handlePress = useCallback(async () => {
    if (expanded) {
      setExpanded(false);
      setPlan(null);
      setError(false);
      expandHeight.value = withSpring(48, { damping: 15 });
      return;
    }
    setLoading(true);
    setError(false);
    setExpanded(true);
    expandHeight.value = withSpring(64, { damping: 15 });
    try {
      const timeout = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 25000)
      );
      const result = await Promise.race([fetchSurprise(tasteMoods, language), timeout]);
      if (result && result.stops?.length > 0) {
        setPlan(result);
        setExpanded(true);
        expandHeight.value = withSpring(200 + (result.stops.length * 70), { damping: 15 });
      } else {
        setError(true);
        expandHeight.value = withSpring(90, { damping: 15 });
        setExpanded(true);
      }
    } catch {
      setError(true);
      expandHeight.value = withSpring(90, { damping: 15 });
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  }, [expanded, tasteMoods, language]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    height: expandHeight.value,
    overflow: 'hidden',
  }));

  const isBosnian = language === 'bs';

  return (
    <Animated.View style={containerAnimStyle}>
      <GlassContainer glowColor={colors.accent} style={styles.container}>
        <TouchableOpacity onPress={handlePress} style={styles.header} activeOpacity={0.8}>
          <Text style={styles.sparkle}>{'\u2726'}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {isBosnian ? 'Iznenadi me' : 'Surprise me'}
          </Text>
          {loading && (
            <>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                {isBosnian ? 'Tražim...' : 'Finding...'}
              </Text>
            </>
          )}
          {expanded && !loading && (
            <Text style={[styles.collapseHint, { color: colors.textSecondary }]}>
              {isBosnian ? 'zatvori' : 'close'}
            </Text>
          )}
        </TouchableOpacity>
        {expanded && error && (
          <View style={styles.errorContent}>
            <Text style={[styles.errorText, { color: colors.textSecondary }]}>
              {isBosnian
                ? 'Nije uspjelo — pokušaj ponovo za trenutak.'
                : 'Couldn\'t load — try again in a moment.'}
            </Text>
          </View>
        )}
        {expanded && plan && (
          <View style={styles.planContent}>
            <Text style={[styles.tagline, { color: colors.accent }]}>
              {isBosnian ? plan.tagline_bs : plan.tagline_en}
            </Text>
            {plan.stops.map((stop, i) => (
              <TouchableOpacity
                key={i}
                style={styles.stopRow}
                onPress={() => { if (stop.venue?.id) router.push(`/venue/${stop.venue.id}`); }}
              >
                <Text style={[styles.stopTime, { color: colors.accent }]}>{stop.time}</Text>
                <View style={styles.stopInfo}>
                  <Text style={[styles.stopVenue, { color: colors.text }]}>{stop.venue_name}</Text>
                  <Text style={[styles.stopPitch, { color: colors.textSecondary }]}>
                    {isBosnian ? stop.pitch_bs : stop.pitch_en}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.attribution}>
              <Text style={styles.attributionText}>
                {isBosnian
                  ? 'Na osnovu podataka Visit Sarajevo i 1.226 lokalnih objekata'
                  : 'Based on data from Visit Sarajevo and 1,226 local venues'}
              </Text>
            </View>
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
  title: { fontSize: 15, fontWeight: '700', fontFamily: 'DMSans_700Bold', flex: 1 },
  collapseHint: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
  loadingText: { fontSize: 12, fontFamily: 'DMSans_400Regular' },
  planContent: { marginTop: 12 },
  tagline: { fontSize: 13, fontFamily: 'DMSans_500Medium', marginBottom: 10 },
  stopRow: { flexDirection: 'row', marginBottom: 10, gap: 10 },
  stopTime: { fontSize: 13, fontFamily: 'DMSans_700Bold', width: 55 },
  stopInfo: { flex: 1 },
  stopVenue: { fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
  stopPitch: { fontSize: 12, fontFamily: 'DMSans_400Regular', marginTop: 2, lineHeight: 16 },
  errorContent: { marginTop: 8 },
  errorText: { fontSize: 13, fontFamily: 'DMSans_400Regular' },
  attribution: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  attributionText: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
