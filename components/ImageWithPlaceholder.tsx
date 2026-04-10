
import React from 'react';
import { View, StyleSheet, Text, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { resolveImageSource } from '@/utils/imageSource';

interface ImageWithPlaceholderProps {
  source: string | number | { uri: string } | null | undefined;
  style?: StyleProp<ViewStyle>;
  categoryEmoji?: string;
  borderRadius?: number;
  accessibilityLabel?: string;
}

export function ImageWithPlaceholder({
  source,
  style,
  categoryEmoji = '🎉',
  borderRadius = 12,
  accessibilityLabel,
}: ImageWithPlaceholderProps) {
  const resolvedSource = resolveImageSource(source);

  if (!resolvedSource) {
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

  return (
    <Image
      source={resolvedSource}
      style={[style, { borderRadius }]}
      contentFit="cover"
      transition={200}
      cachePolicy="disk"
      recyclingKey={typeof resolvedSource === 'string' ? resolvedSource : undefined}
      accessibilityLabel={accessibilityLabel}
    />
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
