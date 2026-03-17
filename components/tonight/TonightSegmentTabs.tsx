import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';
import { useTheme } from '@/hooks/useTheme';
import { TimeSegment, TimeSegmentConfig } from '@/utils/tonightScreen';

interface TonightSegmentTabsProps {
  activeSegment: TimeSegment;
  cardColor: string;
  colorsText: string;
  segments: TimeSegmentConfig[];
  onSelectSegment: (segment: TimeSegment) => void;
}

export function TonightSegmentTabs({
  activeSegment,
  colorsText,
  segments,
  onSelectSegment,
}: TonightSegmentTabsProps) {
  const { isDark } = useTheme();

  return (
    <View style={styles.segmentTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {segments.map((segment) => {
          const isActive = activeSegment === segment.key;

          return (
            <TouchableOpacity
              key={segment.key}
              onPress={() => onSelectSegment(segment.key)}
              activeOpacity={0.7}
            >
              <GlassContainer
                borderRadius={24}
                glowColor={isActive ? '#D4A056' : undefined}
                style={[
                  styles.segmentTab,
                  isActive && styles.segmentTabActive,
                ]}
              >
                <Text style={styles.segmentEmoji}>{segment.emoji}</Text>
                <Text
                  style={[
                    styles.segmentLabel,
                    { color: isActive ? '#FFFFFF' : colorsText },
                  ]}
                >
                  {segment.label}
                </Text>
              </GlassContainer>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentTabs: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  content: {
    paddingHorizontal: 16,
    gap: 10,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  segmentTabActive: {
    backgroundColor: 'rgba(212,160,86,0.85)',
  },
  segmentEmoji: {
    fontSize: 18,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'DMSans_600SemiBold',
  },
});
