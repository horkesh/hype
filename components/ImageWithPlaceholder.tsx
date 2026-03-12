
import React, { useState } from 'react';
import { View, Image, StyleSheet, ImageSourcePropType, Text, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SkeletonLoader } from './SkeletonLoader';
import { resolveImageSource } from '@/utils/imageSource';

interface ImageWithPlaceholderProps {
  source: string | number | ImageSourcePropType | null | undefined;
  style?: any;
  categoryEmoji?: string;
  borderRadius?: number;
}

export function ImageWithPlaceholder({
  source,
  style,
  categoryEmoji = '🎉',
  borderRadius = 12,
}: ImageWithPlaceholderProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const resolvedSource = resolveImageSource(source);

  if (!resolvedSource || error) {
    return (
      <View style={[styles.placeholder, style, { borderRadius }]}>
        <LinearGradient
          colors={['#D4A056', '#B8894A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.emoji}>{categoryEmoji}</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={[style, { borderRadius }]}>
        <Image
          source={resolvedSource}
          style={[style, { borderRadius }]}
        />
      </View>
    );
  }

  return (
    <View style={[style, { borderRadius }]}>
      {loading && (
        <View style={StyleSheet.absoluteFill}>
          <SkeletonLoader height="100%" width="100%" borderRadius={borderRadius} />
        </View>
      )}
      <Image
        source={resolvedSource}
        style={[style, { borderRadius }]}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 48,
  },
});
