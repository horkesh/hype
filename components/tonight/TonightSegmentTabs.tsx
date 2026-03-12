import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  cardColor,
  colorsText,
  segments,
  onSelectSegment,
}: TonightSegmentTabsProps) {
  return (
    <View style={styles.segmentTabs}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.content}>
        {segments.map((segment) => {
          const isActive = activeSegment === segment.key;

          return (
            <TouchableOpacity
              key={segment.key}
              style={[
                styles.segmentTab,
                { backgroundColor: isActive ? '#D4A056' : cardColor },
              ]}
              onPress={() => onSelectSegment(segment.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.segmentEmoji}>{segment.emoji}</Text>
              <Text style={[styles.segmentLabel, { color: isActive ? '#FFFFFF' : colorsText }]}>
                {segment.label}
              </Text>
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  segmentTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  segmentEmoji: {
    fontSize: 18,
  },
  segmentLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
});
