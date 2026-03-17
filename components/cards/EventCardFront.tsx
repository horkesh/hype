import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';

interface EventCardFrontProps {
  title: string;
  imageUrl?: string;
  startTime?: string;
  moodIds?: string[];
  urgency?: 'tonight' | 'tomorrow' | 'free' | null;
}

export function EventCardFront({ title, imageUrl, startTime, urgency }: EventCardFrontProps) {
  const urgencyMap: Record<string, { label: string; variant: 'danger' | 'warning' | 'success' }> = {
    tonight: { label: 'Večeras!', variant: 'danger' },
    tomorrow: { label: 'Sutra', variant: 'warning' },
    free: { label: 'Besplatan', variant: 'success' },
  };
  return (
    <View style={styles.container}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]} />
      )}
      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.gradient}>
        {startTime && <Text style={styles.time}>{startTime}</Text>}
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
      </LinearGradient>
      {urgency && urgencyMap[urgency] && (
        <View style={styles.urgencyBadge}>
          <GlassBadge label={urgencyMap[urgency].label} variant={urgencyMap[urgency].variant} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { ...StyleSheet.absoluteFillObject, borderRadius: designTokens.radius.card },
  placeholder: { backgroundColor: '#2A2A3E' },
  gradient: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16, borderRadius: designTokens.radius.card },
  time: { fontSize: 12, color: '#D4A056', fontWeight: '700', fontFamily: 'DMSans_700Bold', marginBottom: 4 },
  title: { ...designTokens.typography.cardTitle, color: '#FFF' },
  urgencyBadge: { position: 'absolute', top: 12, right: 12 },
});
