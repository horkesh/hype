
import React, { useEffect } from 'react';
import { Platform, View, ViewProps } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';

interface AnimatedCardProps extends ViewProps {
  children: React.ReactNode;
  delay?: number;
  style?: any;
}

export function AnimatedCard({ children, delay = 0, style, ...props }: AnimatedCardProps) {
  if (Platform.OS === 'web') {
    return (
      <View style={style} {...props}>
        {children}
      </View>
    );
  }

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
