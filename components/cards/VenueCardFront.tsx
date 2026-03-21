import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';

interface VenueCardFrontProps {
  name: string;
  imageUrl?: string;
  category?: string;
  isOpen?: boolean;
  moodIds?: string[];
  isHiddenGem?: boolean;
}

export function VenueCardFront({
  name,
  imageUrl,
  category,
  isOpen,
  moodIds = [],
  isHiddenGem,
}: VenueCardFrontProps) {
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(20,10,0,0.7)']}
        style={styles.gradient}
      >
        <Text style={styles.title} numberOfLines={2}>{name}</Text>
      </LinearGradient>
      {category && (
        <View style={styles.categoryPill}>
          <GlassBadge label={category} />
        </View>
      )}
      {isOpen !== undefined && (
        <View style={styles.statusBadge}>
          <GlassBadge
            label={isOpen ? 'Open' : 'Closed'}
            variant={isOpen ? 'success' : 'muted'}
          />
        </View>
      )}
      {isHiddenGem && (
        <View style={styles.gemBadge}>
          <GlassBadge label="Hidden Gem" variant="accent" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { ...StyleSheet.absoluteFillObject, borderRadius: designTokens.radius.card },
  placeholder: { backgroundColor: '#2A2A3E' },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
    borderRadius: designTokens.radius.card,
  },
  title: {
    ...designTokens.typography.cardTitle,
    color: '#FFF',
  },
  categoryPill: { position: 'absolute', top: 12, left: 12 },
  statusBadge: { position: 'absolute', top: 12, right: 12 },
  gemBadge: { position: 'absolute', top: 44, right: 12 },
});
