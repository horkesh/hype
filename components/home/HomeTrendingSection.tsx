import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { fetchTrendingVenues } from '@/utils/crowdSignals';
import { FlippableCard } from '@/components/cards/FlippableCard';
import { VenueCardFront } from '@/components/cards/VenueCardFront';
import { VenueCardBack } from '@/components/cards/VenueCardBack';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { SectionHeader } from '@/components/SectionHeader';
import { useRouter } from 'expo-router';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { moodToDbValue } from '@/utils/homeScreenContent';

interface HomeTrendingSectionProps {
  language: string;
  selectedMood?: string | null;
}

export function HomeTrendingSection({ language, selectedMood }: HomeTrendingSectionProps) {
  const router = useRouter();
  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    fetchTrendingVenues(6).then((data) => {
      const dbMood = selectedMood ? moodToDbValue(selectedMood) : null;
      const filtered = dbMood
        ? data.filter((v: any) => v.moods?.includes(dbMood))
        : data;
      if (mounted) setVenues(filtered);
    });
    return () => {
      mounted = false;
    };
  }, [selectedMood]);

  if (venues.length === 0) return null;

  return (
    <View style={styles.container}>
      <SectionHeader
        title={language === 'bs' ? 'Trending sada' : 'Trending Now'}
      />
      <FlatList
        horizontal
        data={venues}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View>
            <FlippableCard
              width={220}
              height={280}
              style={styles.card}
              onPress={() => router.push(`/venue/${item.id}`)}
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
                  description={
                    language === 'bs'
                      ? item.description_bs
                      : item.description_en
                  }
                />
              }
            />
            {/* Crowd badge overlay */}
            <View style={styles.crowdBadge}>
              <GlassBadge
                label={language === 'bs' ? `${item.checkin_count} sada ovdje` : `${item.checkin_count} here now`}
                variant="danger"
                size="sm"
              />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 24 },
  list: { paddingHorizontal: 16 },
  card: { marginRight: 12 },
  crowdBadge: { position: 'absolute', bottom: 16, left: 12 },
});
