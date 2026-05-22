
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View, ViewProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  cancelAnimation,
  Easing,
  useReducedMotion,
} from 'react-native-reanimated';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

const isWeb = Platform.OS === 'web';

export function AnimatedCard({ children, delay = 0, style, ...props }: AnimatedCardProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useSharedValue(isWeb || reducedMotion ? 1 : 0);
  const translateY = useSharedValue(isWeb || reducedMotion ? 0 : 20);

  useEffect(() => {
    if (isWeb || reducedMotion) return;
    opacity.value = withDelay(delay, withTiming(1, { duration: 400, easing: Easing.out(Easing.cubic) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.cubic) }));
    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateY);
    };
  }, [delay, opacity, translateY, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (isWeb) {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
