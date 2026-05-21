import React, { useEffect, useState } from 'react';
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { supabase } from '@/integrations/supabase/client';
import { designTokens } from '@/styles/designTokens';

interface ExploreWellnessCardProps {
  language: 'bs' | 'en';
}

// Self-contained Explore-tab card for the Wellness vertical. Loads one
// highly-rated wellness venue's cover as backdrop and a count chip showing
// "X mjesta". Tap navigates to the filtered Wellness view.
export function ExploreWellnessCard({ language }: ExploreWellnessCardProps) {
  const router = useRouter();
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      // Bias hero pick toward spa/aesthetic/beauty venues (upscale, polished
      // photography) over hair salons + gyms (functional interior shots).
      // Within that pool, ratings_count signals established/flagship venues
      // that tend to have a real curated photo, not just a phone snap.
      supabase
        .from('venues')
        .select('cover_image_url')
        .eq('category', 'wellness')
        .eq('is_active', true)
        .not('cover_image_url', 'is', null)
        .overlaps('tags', ['spa', 'aesthetic', 'beauty_salon'])
        .gte('google_rating', 4.5)
        .order('google_ratings_count', { ascending: false, nullsFirst: false })
        .order('google_rating', { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .eq('category', 'wellness')
        .eq('is_active', true),
    ]).then(([cover, total]) => {
      if (!mounted) return;
      setCoverUrl(cover.data?.cover_image_url ?? null);
      setCount(total.count ?? 0);
    });
    return () => { mounted = false; };
  }, []);

  // Don't render at all if no wellness data exists yet.
  if (count !== null && count === 0) return null;

  const title = language === 'bs' ? 'Wellness u Sarajevu' : 'Wellness in Sarajevo';
  const subtitle = language === 'bs'
    ? 'Saloni ljepote, spa, fitness, yoga'
    : 'Beauty salons, spa, fitness, yoga';
  const cta = language === 'bs' ? 'Pogledaj sve' : 'See all';

  const content = (
    <LinearGradient
      colors={['rgba(20,10,0,0.0)', 'rgba(20,10,0,0.85)']}
      style={styles.overlay}
    >
      <View style={styles.body}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <View style={styles.ctaWrap}>
          {count !== null && count > 0 && (
            <Text style={styles.count}>{count}</Text>
          )}
          <Text style={styles.cta}>{cta} →</Text>
        </View>
      </View>
    </LinearGradient>
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => router.push('/wellness' as never)}
      style={styles.container}
      accessibilityLabel={title}
      accessibilityRole="button"
    >
      {coverUrl ? (
        <ImageBackground
          source={{ uri: coverUrl }}
          style={styles.image}
          imageStyle={styles.imageRadius}
        >
          {content}
        </ImageBackground>
      ) : (
        <View style={[styles.image, styles.placeholder]}>{content}</View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    height: 132,
    width: '100%',
    justifyContent: 'flex-end',
  },
  imageRadius: { borderRadius: 16 },
  placeholder: {
    backgroundColor: 'rgba(212,160,86,0.15)',
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 16,
  },
  body: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  title: {
    ...designTokens.typography.cardTitle,
    color: '#FFF',
    fontSize: 22,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  ctaWrap: {
    alignItems: 'flex-end',
    gap: 4,
  },
  count: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#D4A056',
  },
  cta: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
});
