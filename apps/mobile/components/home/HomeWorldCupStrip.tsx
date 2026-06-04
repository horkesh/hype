import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

import { useTheme } from '@/hooks/useTheme';
import { HomeMatch, HomeWatchVenue, loadBosniaMatches, loadWatchPartyVenues } from '@/utils/homeData';

/** Live countdown to a kickoff timestamp. */
function useCountdown(target: string | undefined): string {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!target) return;
    const id = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [target]);
  if (!target) return '';
  const diff = Date.parse(target) - Date.now();
  if (diff <= 0) return 'LIVE';
  const d = Math.floor(diff / 86_400_000);
  const h = Math.floor((diff % 86_400_000) / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  if (d >= 1) return `${d}d ${h}h`;
  return `${h}h ${m}m`;
}

interface HomeWorldCupStripProps {
  language: string;
}

export function HomeWorldCupStrip({ language }: HomeWorldCupStripProps): React.ReactElement | null {
  const { colors } = useTheme();
  const router = useRouter();
  const [matches, setMatches] = useState<HomeMatch[]>([]);
  const [venues, setVenues] = useState<HomeWatchVenue[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadBosniaMatches(), loadWatchPartyVenues()])
      .then(([m, v]) => { if (mounted) { setMatches(m); setVenues(v); setLoaded(true); } })
      .catch(() => { if (mounted) setLoaded(true); });
    return () => { mounted = false; };
  }, []);

  const next = matches[0];
  const countdown = useCountdown(next?.start_datetime);

  if (!loaded || !next) return null;

  const title = (language === 'bs' ? next.title_bs : next.title_en) || next.title_bs;
  const watchAt = venues[0];
  const watchLabel = language === 'bs' ? 'Gdje gledati' : 'Where to watch';

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.accent, colors.surfaceHover ?? colors.card]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.strip}
      >
        <View style={styles.left}>
          <Text style={styles.eyebrow}>🇧🇦 {language === 'bs' ? 'SVJETSKO PRVENSTVO' : 'WORLD CUP'}</Text>
          <Text style={styles.match} numberOfLines={1}>{title.replace(/^.*?:\s*/, '')}</Text>
          {watchAt && (
            <TouchableOpacity
              onPress={() => router.push(`/venue/${watchAt.id}`)}
              accessibilityRole="link"
              accessibilityLabel={`${watchLabel}: ${watchAt.name}`}
            >
              <Text style={styles.watch}>📺 {watchLabel}: {watchAt.name}</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.countdownBox}>
          <Text style={styles.countdown}>{countdown}</Text>
          <Text style={styles.countdownSub}>{language === 'bs' ? 'do utakmice' : 'to kickoff'}</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 16 },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  left: { flex: 1 },
  eyebrow: { color: 'rgba(255,255,255,0.9)', fontSize: 11, letterSpacing: 1.5, fontFamily: 'DMSans_700Bold', fontWeight: '700' },
  match: { color: '#FFF', fontSize: 18, fontFamily: 'DMSerifDisplay_400Regular', marginTop: 2 },
  watch: { color: 'rgba(255,255,255,0.92)', fontSize: 12.5, marginTop: 4, fontFamily: 'DMSans_500Medium' },
  countdownBox: { alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 14, paddingVertical: 8, paddingHorizontal: 12, minWidth: 78 },
  countdown: { color: '#FFF', fontSize: 20, fontFamily: 'DMSans_700Bold', fontWeight: '700' },
  countdownSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontFamily: 'DMSans_400Regular', marginTop: 2 },
});
