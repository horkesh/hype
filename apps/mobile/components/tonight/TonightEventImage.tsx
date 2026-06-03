import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { resolveImageSource } from '@/utils/imageSource';

interface TonightEventImageProps {
  coverImageUrl: string | null;
}

export function TonightEventImage({ coverImageUrl }: TonightEventImageProps) {
  if (coverImageUrl) {
    return (
      <Image
        source={resolveImageSource(coverImageUrl)}
        style={styles.image}
        resizeMode="cover"
      />
    );
  }

  return (
    <LinearGradient
      colors={['#8E2DE2', '#5B16A8']}
      style={styles.image}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: 180,
  },
});
