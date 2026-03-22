import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { HypeHeader } from '@/components/HypeHeader';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { loadHeritageWalkDetail, type HeritageWalk, type HeritageWalkStop } from '@/utils/heritageWalkData';
import { getWalkTitle, getWalkDescription, getWalkSummary, getStopTitle, getStopDescription, getWhatToLookFor } from '@/utils/heritageWalkScreen';
import { designTokens } from '@/styles/designTokens';

export default function HeritageWalkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useApp();
  const { colors } = useTheme();
  const [walk, setWalk] = useState<HeritageWalk | null>(null);
  const [stops, setStops] = useState<HeritageWalkStop[]>([]);

  useEffect(() => {
    if (id) {
      loadHeritageWalkDetail(id).then(({ walk: w, stops: s }) => {
        setWalk(w);
        setStops(s);
      });
    }
  }, [id]);

  if (!walk) {
    return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <HypeHeader />
        <View style={styles.loading}>
          <Text style={{ color: colors.text, fontFamily: 'DMSans_400Regular' }}>
            {language === 'bs' ? 'Učitavanje...' : 'Loading...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <HypeHeader />
      <ScrollView contentContainerStyle={styles.content}>
        {/* Walk header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {getWalkTitle(walk, language)}
          </Text>
          <Text style={[styles.summary, { color: colors.textSecondary }]}>
            {getWalkSummary(walk, language)}
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {getWalkDescription(walk, language)}
          </Text>
          <View style={styles.attributionRow}>
            <GlassBadge label="Visit Sarajevo" variant="accent" size="sm" />
          </View>
        </View>

        {/* Timeline of stops */}
        {stops.map((stop, index) => (
          <View key={stop.id} style={styles.stopRow}>
            {/* Timeline connector */}
            <View style={styles.timeline}>
              <View style={[styles.dot, { backgroundColor: colors.accent }]}>
                <Text style={styles.dotText}>{index + 1}</Text>
              </View>
              {index < stops.length - 1 && (
                <View style={[styles.line, { backgroundColor: 'rgba(212,160,86,0.3)' }]} />
              )}
            </View>

            {/* Stop content */}
            <GlassContainer style={styles.stopCard}>
              {stop.venues?.cover_image_url && (
                <Image source={{ uri: stop.venues.cover_image_url }} style={styles.stopImage} />
              )}
              <Text style={[styles.stopTitle, { color: colors.text }]}>
                {getStopTitle(stop, language)}
              </Text>
              {stop.venues?.name && (
                <Text style={[styles.venueName, { color: colors.accent }]}>
                  {stop.venues.name}
                </Text>
              )}
              <Text style={[styles.stopDescription, { color: colors.textSecondary }]}>
                {getStopDescription(stop, language)}
              </Text>

              {getWhatToLookFor(stop, language) && (
                <View style={styles.lookFor}>
                  <MaterialCommunityIcons name="eye-outline" size={14} color={colors.accent} />
                  <Text style={[styles.lookForText, { color: colors.text }]}>
                    {getWhatToLookFor(stop, language)}
                  </Text>
                </View>
              )}

              {stop.walking_minutes_to_next > 0 && index < stops.length - 1 && (
                <View style={styles.walkTime}>
                  <MaterialCommunityIcons name="walk" size={14} color="rgba(255,255,255,0.4)" />
                  <Text style={styles.walkTimeText}>
                    {stop.walking_minutes_to_next} min {language === 'bs' ? 'pješice' : 'walk'}
                  </Text>
                </View>
              )}

              {stop.source_attribution && (
                <Text style={styles.source}>
                  {language === 'bs' ? 'Izvor' : 'Source'}: {stop.source_attribution}
                </Text>
              )}
            </GlassContainer>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: {
    ...designTokens.typography.heroTitle,
    marginBottom: 4,
  },
  summary: {
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 22,
    marginBottom: 8,
  },
  attributionRow: { flexDirection: 'row' },
  stopRow: { flexDirection: 'row', marginBottom: 16 },
  timeline: { width: 40, alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    fontSize: 13,
    fontFamily: 'DMSans_700Bold',
    color: '#000',
  },
  line: { width: 2, flex: 1, marginTop: 4 },
  stopCard: { flex: 1, padding: 12, marginLeft: 8 },
  stopImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  stopTitle: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  venueName: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
    marginBottom: 4,
  },
  stopDescription: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 20,
    marginBottom: 8,
  },
  lookFor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(212,160,86,0.08)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
  },
  lookForText: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
    flex: 1,
  },
  walkTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  walkTimeText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.4)',
  },
  source: {
    fontSize: 10,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'right',
  },
});
