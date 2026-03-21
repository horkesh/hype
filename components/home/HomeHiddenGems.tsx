import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { supabase } from '@/integrations/supabase/client';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { useRouter } from 'expo-router';
import { SectionHeader } from '@/components/SectionHeader';

interface HomeHiddenGemsProps {
  language: string;
  selectedMood?: string | null;
}

export function HomeHiddenGems({ language, selectedMood }: HomeHiddenGemsProps) {
  const router = useRouter();
  const [gems, setGems] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    let query = supabase
      .from('venues')
      .select('*')
      .eq('is_hidden_gem', true)
      .limit(6);
    if (selectedMood) {
      query = query.contains('moods', [selectedMood]);
    }
    query.then(({ data }) => {
      if (mounted && data) setGems(data);
    });
    return () => { mounted = false; };
  }, [selectedMood]);

  if (gems.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader title={language === 'bs' ? 'Skriveni dragulji' : 'Hidden Gems'} />
      <FlatList
        horizontal
        data={gems}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <FlippableCard
            width={220}
            height={280}
            style={styles.card}
            onPress={() => router.push(`/venue/${item.id}`)}
            front={
              <VenueCardFront
                name={item.name}
                imageUrl={item.cover_image_url}
                category={item.category}
                isHiddenGem
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
