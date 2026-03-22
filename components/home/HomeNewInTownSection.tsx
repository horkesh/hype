import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { designTokens } from '@/styles/designTokens';
import { NewInTownVenue, loadHomeNewInTown } from '@/utils/homeData';
import { getCategoryLabel } from '@/utils/categoryLabels';
import { HomeLanguage } from '@/utils/homeHeroState';

interface HomeNewInTownSectionProps {
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
}

export function HomeNewInTownSection({ language, colors }: HomeNewInTownSectionProps) {
  const router = useRouter();
  const [venues, setVenues] = useState<NewInTownVenue[]>([]);

  useEffect(() => {
    let mounted = true;
    loadHomeNewInTown()
      .then((data) => {
        if (mounted) setVenues(data.slice(0, 4));
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  if (venues.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[designTokens.typography.sectionHeader, { color: colors.text, marginBottom: 4, paddingHorizontal: 16 }]}>
        {language === 'bs' ? 'Novo u gradu' : 'New in Town'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, paddingHorizontal: 16 }]}>
        {language === 'bs' ? 'Tek otvoreno' : 'Just opened'}
      </Text>

      <View style={styles.list}>
        {venues.map((venue) => {
          const categoryLabel = getCategoryLabel(venue.category, language);
          const secondary = [categoryLabel, venue.neighborhood].filter(Boolean).join(' · ');

          return (
            <TouchableOpacity
              key={venue.id}
              activeOpacity={0.75}
              onPress={() => router.push(`/venue/${venue.id}`)}
              style={[styles.row, { backgroundColor: colors.card }]}
            >
              {venue.cover_image_url ? (
                <Image source={{ uri: venue.cover_image_url }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, { backgroundColor: colors.textSecondary }]} />
              )}

              <View style={styles.info}>
                <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                  {venue.name}
                </Text>
                <Text style={[styles.secondary, { color: colors.textSecondary }]} numberOfLines={1}>
                  {secondary}
                </Text>
              </View>

              {venue.google_rating != null && (
                <Text style={[styles.rating, { color: colors.accent }]}>
                  {venue.google_rating.toFixed(1)}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 12,
  },
  list: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  secondary: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
  },
  rating: {
    fontSize: 15,
    fontFamily: 'DMSans_700Bold',
    marginLeft: 8,
  },
});
