import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { telemach } from '@/styles/telemach';

type Variant = 'compact' | 'badge' | 'hero';
type Tone = 'light' | 'brand';

interface PoweredByTelemachProps {
  variant?: Variant;
  /** light = white wordmark (on purple/dark); brand = violet wordmark (on light) */
  tone?: Tone;
  /** Hide the "POWERED BY" eyebrow and show only the wordmark */
  wordmarkOnly?: boolean;
  style?: ViewStyle;
}

const SIZES: Record<Variant, { eyebrow: number; word: number; gap: number; dot: number }> = {
  compact: { eyebrow: 8, word: 16, gap: 1, dot: 5 },
  badge: { eyebrow: 9, word: 20, gap: 2, dot: 6 },
  hero: { eyebrow: 13, word: 40, gap: 6, dot: 11 },
};

/**
 * Faithful recreation of Telemach's "Powered by Telemach" sponsorship lockup.
 * Wordmark + letter-spaced eyebrow + the signature EON magenta accent dot.
 */
export function PoweredByTelemach({
  variant = 'badge',
  tone = 'light',
  wordmarkOnly = false,
  style,
}: PoweredByTelemachProps): React.ReactElement {
  const s = SIZES[variant];
  const wordColor = tone === 'light' ? telemach.onPurple : telemach.purple;
  const eyebrowColor = tone === 'light' ? telemach.onPurpleDim : telemach.purpleDeep;

  return (
    <View style={[styles.root, style]} accessibilityRole="image" accessibilityLabel="Powered by Telemach">
      {!wordmarkOnly && (
        <Text style={[styles.eyebrow, { fontSize: s.eyebrow, color: eyebrowColor }]}>
          POWERED BY
        </Text>
      )}
      <View style={[styles.wordRow, { marginTop: s.gap }]}>
        <Text style={[styles.word, { fontSize: s.word, color: wordColor }]}>telemach</Text>
        <View
          style={[
            styles.dot,
            { width: s.dot, height: s.dot, borderRadius: s.dot / 2, marginLeft: s.dot * 0.6 },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
  },
  eyebrow: {
    fontFamily: 'DMSans_700Bold',
    letterSpacing: 2.5,
    fontWeight: '700',
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  word: {
    fontFamily: 'DMSans_700Bold',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  dot: {
    backgroundColor: telemach.magenta,
  },
});
