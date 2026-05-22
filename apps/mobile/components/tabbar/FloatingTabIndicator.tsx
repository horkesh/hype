import React from 'react';
import Animated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

interface FloatingTabIndicatorProps {
  animatedValue: Animated.SharedValue<number>;
  indicatorColor: string;
  indicatorEnd: number;
  maxIndex: number;
  indicatorStart: number;
  tabWidthPercent: `${number}%`;
}

export function FloatingTabIndicator({
  animatedValue,
  indicatorColor,
  indicatorEnd,
  maxIndex,
  indicatorStart,
  tabWidthPercent,
}: FloatingTabIndicatorProps) {
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          animatedValue.value,
          [0, maxIndex],
          [indicatorStart, indicatorEnd]
        ),
      },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: 4,
          left: 2,
          bottom: 4,
          borderRadius: 27,
          backgroundColor: indicatorColor,
          width: tabWidthPercent,
        },
        indicatorStyle,
      ]}
    />
  );
}
