import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { supabase } from '@/integrations/supabase/client';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/SectionHeader';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { moodToDbValue } from '@/utils/homeScreenContent';

interface HomeFeaturedVenuesProps {
  language: string;
  selectedMood?: string | null;
}

export function HomeFeaturedVenues({ language, selectedMood }: HomeFeaturedVenuesProps) {
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    let query = supabase
      .from('venues')
      .select('*')
      .eq('is_featured', true)
      .eq('is_active', true)
      .order('name', { ascending: true })
      .limit(12);
    if (selectedMood) {
      query = query.contains('moods', [moodToDbValue(selectedMood)]);
    }
    query.then(({ data }) => {
      if (mounted && data) setVenues(data);
    });
    return () => { mounted = false; };
  }, [selectedMood]);

  if (venues.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title={language === 'bs' ? 'Istaknuto u Sarajevu' : 'Featured in Sarajevo'} />
      <FlatList
        horizontal
        data={venues}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FlippableCard
            width={220}
            height={280}
            style={styles.card}
            onPress={() => router.push(`/venue/${item.id}`)}
            accessibilityLabel={item.name}
            front={
              <VenueCardFront
                name={item.name}
                imageUrl={item.cover_image_url}
                category={getCategoryLabel(item.category, language as 'bs' | 'en')}
              />
            }
            back={
              <VenueCardBack
                name={item.name}
                address={item.address}
                description={language === 'bs' ? item.description_bs : item.description_en}
              />
            }
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  list: { paddingHorizontal: 16 },
  card: { marginRight: 12 },
});
