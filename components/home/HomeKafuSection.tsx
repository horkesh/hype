import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { supabase } from '@/integrations/supabase/client';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';

interface HomeKafuSectionProps {
  language: string;
  selectedMood?: string | null;
}

export function HomeKafuSection({ language, selectedMood }: HomeKafuSectionProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [cafe, setCafe] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const rollCafe = useCallback(async () => {
    setLoading(true);
    try {
      const offset = new Date().getMinutes();
      let query = supabase
        .from('venues')
        .select('id, name, neighborhood, cover_image_url, description_en, description_bs, moods')
        .eq('category', 'cafe');
      if (selectedMood) {
        query = query.contains('moods', [selectedMood]);
      }
      const { data } = await query.range(offset % 20, (offset % 20) + 1);
      if (data && data.length > 0) {
        setCafe(data[0]);
      } else if (selectedMood) {
        // Fallback: no cafe matches this mood, try without filter
        const { data: fallback } = await supabase
          .from('venues')
          .select('id, name, neighborhood, cover_image_url, description_en, description_bs')
          .eq('category', 'cafe')
          .range(offset % 20, (offset % 20) + 1);
        if (fallback && fallback.length > 0) setCafe(fallback[0]);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [selectedMood]);

  return (
    <GlassContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {language === 'bs' ? 'Gdje na kafu?' : 'Coffee time?'}
        </Text>
      </View>
      {!cafe ? (
        <TouchableOpacity onPress={rollCafe} style={styles.ctaButton} activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.ctaText}>{language === 'bs' ? 'Hajde!' : "Let's go!"}</Text>
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.result}>
          <TouchableOpacity onPress={() => router.push(`/venue/${cafe.id}`)}>
            {cafe.cover_image_url && (
              <Image source={{ uri: cafe.cover_image_url }} style={styles.cafeImage} />
            )}
            <Text style={[styles.cafeName, { color: colors.text }]}>{cafe.name}</Text>
            {cafe.neighborhood && (
              <Text style={[styles.cafeNeighborhood, { color: colors.textSecondary }]}>
                {cafe.neighborhood}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={rollCafe} style={styles.rerollButton}>
            <Text style={styles.rerollText}>{language === 'bs' ? 'Daj drugo' : 'Another one'}</Text>
          </TouchableOpacity>
        </View>
      )}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, marginHorizontal: 16, marginBottom: 16 },
  header: { marginBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  ctaButton: { backgroundColor: '#D4A056', paddingVertical: 12, borderRadius: 16, alignItems: 'center' },
  ctaText: { color: '#FFF', fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  result: {},
  cafeImage: { width: '100%', height: 120, borderRadius: 16, marginBottom: 8 },
  cafeName: { fontSize: 16, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
  cafeNeighborhood: { fontSize: 13, marginTop: 2, fontFamily: 'DMSans_400Regular' },
  rerollButton: { marginTop: 10, alignSelf: 'center' },
  rerollText: { color: '#D4A056', fontSize: 14, fontWeight: '600', fontFamily: 'DMSans_700Bold' },
});
