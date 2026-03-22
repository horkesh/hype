import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { designTokens } from '@/styles/designTokens';
import { HomeEventItem, loadHomeFeaturedEvent } from '@/utils/homeData';
import { getHomeEventCardContent } from '@/utils/homeEventsSection';
import { HomeLanguage } from '@/utils/homeHeroState';

interface HomeFeaturedSectionProps {
  language: HomeLanguage;
  colors: {
    accent: string;
    card: string;
    text: string;
    textSecondary: string;
  };
  onEventPress: (id: string) => void;
}

export function HomeFeaturedSection({ language, colors, onEventPress }: HomeFeaturedSectionProps) {
  const [event, setEvent] = useState<HomeEventItem | null>(null);

  useEffect(() => {
    let mounted = true;
    loadHomeFeaturedEvent()
      .then((data) => {
        if (mounted) setEvent(data);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  if (!event) return null;

  const content = getHomeEventCardContent(language, event);

  return (
    <View style={styles.container}>
      <Text style={[designTokens.typography.sectionHeader, { color: colors.text, marginBottom: 4, paddingHorizontal: 16 }]}>
        {language === 'bs' ? 'Izdvojeno' : 'Featured'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary, paddingHorizontal: 16 }]}>
        {language === 'bs' ? 'Naš izbor za tebe' : "Editor's picks for you"}
      </Text>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => onEventPress(event.id)}
        style={[styles.card, { backgroundColor: colors.card }]}
      >
        {event.cover_image_url ? (
          <Image source={{ uri: event.cover_image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: colors.card }]} />
        )}
        <LinearGradient
          colors={['transparent', 'rgba(20,10,0,0.7)']}
          style={styles.overlay}
        >
          <Text style={[designTokens.typography.cardTitle, { color: '#FFFFFF' }]} numberOfLines={2}>
            {content.title}
          </Text>
          <Text style={[styles.meta, { color: 'rgba(255,255,255,0.8)' }]}>
            {content.dateLabel}{content.venueName ? ` · ${content.venueName}` : ''}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
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
  card: {
    marginHorizontal: 16,
    borderRadius: designTokens.radius.card,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 40,
  },
  meta: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
});
