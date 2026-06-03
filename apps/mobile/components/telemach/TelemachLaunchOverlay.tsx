import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { PoweredByTelemach } from '@/components/telemach/PoweredByTelemach';
import { telemach } from '@/styles/telemach';

interface TelemachLaunchOverlayProps {
  onFinish: () => void;
}

/**
 * Co-branded launch splash shown over the app on cold start.
 * "Look × Telemach" reveal — sells the funded partnership in the live demo.
 */
export function TelemachLaunchOverlay({ onFinish }: TelemachLaunchOverlayProps): React.ReactElement {
  const opacity = useRef(new Animated.Value(0)).current;
  const lift = useRef(new Animated.Value(16)).current;
  const screen = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: 620,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1100),
      Animated.timing(screen, {
        toValue: 0,
        duration: 460,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
  }, [opacity, lift, screen, onFinish]);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, { opacity: screen }]} pointerEvents="none">
      <LinearGradient
        colors={telemach.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View style={[styles.center, { opacity, transform: [{ translateY: lift }] }]}>
        <View style={styles.lockup}>
          <Text style={styles.look}>Look</Text>
          <Text style={styles.cross}>×</Text>
          <PoweredByTelemach variant="hero" wordmarkOnly tone="light" />
        </View>
        <View style={styles.footer}>
          <PoweredByTelemach variant="badge" tone="light" />
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    zIndex: 999,
    elevation: 999,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  look: {
    fontFamily: 'DMSerifDisplay_400Regular',
    fontSize: 44,
    color: telemach.onPurple,
    letterSpacing: 1,
  },
  cross: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 26,
    color: telemach.onPurpleDim,
  },
  footer: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
  },
});
