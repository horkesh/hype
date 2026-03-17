import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';

interface SeriesCardProps {
  title: string;
  imageUrl?: string;
  startDate?: string;
  eventCount?: number;
  onPress?: () => void;
}

function getCountdown(startDate?: string): string | null {
  if (!startDate) return null;
  const diff = new Date(startDate).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days === 1 ? 'Starts tomorrow' : `Starts in ${days} days`;
}

export function SeriesCard({ title, imageUrl, startDate, eventCount, onPress }: SeriesCardProps) {
  const countdown = getCountdown(startDate);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradient}>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {eventCount !== undefined && (
          <Text style={styles.eventCount}>{eventCount} events</Text>
        )}
      </LinearGradient>
      {countdown && (
        <View style={styles.countdownBadge}>
          <GlassBadge label={countdown} variant="accent" size="sm" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: designTokens.radius.card, overflow: 'hidden', height: 180 },
  image: { ...StyleSheet.absoluteFillObject },
  placeholder: { backgroundColor: '#2A2A3E' },
  gradient: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16 },
  title: { ...designTokens.typography.cardTitle, color: '#FFF' },
  eventCount: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: 'DMSans_400Regular', marginTop: 4 },
  countdownBadge: { position: 'absolute', top: 12, right: 12 },
});
