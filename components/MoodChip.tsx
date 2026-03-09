
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface MoodChipProps {
  emoji: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  moodId: string;
}

const MOOD_COLORS: Record<string, { light: string; dark: string }> = {
  party: { light: 'rgba(239, 68, 68, 0.15)', dark: 'rgba(239, 68, 68, 0.25)' },
  chill: { light: 'rgba(59, 130, 246, 0.15)', dark: 'rgba(59, 130, 246, 0.25)' },
  girls_night: { light: 'rgba(236, 72, 153, 0.15)', dark: 'rgba(236, 72, 153, 0.25)' },
  date_night: { light: 'rgba(251, 146, 60, 0.15)', dark: 'rgba(251, 146, 60, 0.25)' },
  muzika: { light: 'rgba(168, 85, 247, 0.15)', dark: 'rgba(168, 85, 247, 0.25)' },
  romantika: { light: 'rgba(190, 18, 60, 0.15)', dark: 'rgba(190, 18, 60, 0.25)' },
  kultura: { light: 'rgba(99, 102, 241, 0.15)', dark: 'rgba(99, 102, 241, 0.25)' },
  foodie: { light: 'rgba(234, 179, 8, 0.15)', dark: 'rgba(234, 179, 8, 0.25)' },
  brunch: { light: 'rgba(251, 207, 232, 0.3)', dark: 'rgba(251, 207, 232, 0.2)' },
  after_work: { light: 'rgba(217, 119, 6, 0.15)', dark: 'rgba(217, 119, 6, 0.25)' },
  outdoor: { light: 'rgba(34, 197, 94, 0.15)', dark: 'rgba(34, 197, 94, 0.25)' },
  turista: { light: 'rgba(14, 165, 233, 0.15)', dark: 'rgba(14, 165, 233, 0.25)' },
};

export function MoodChip({ emoji, label, isSelected, onPress, moodId }: MoodChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const moodColor = MOOD_COLORS[moodId] || { light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.1)' };
  const backgroundColor = colors.theme === 'dark' ? moodColor.dark : moodColor.light;

  const selectedBackgroundColor = colors.accent;
  const selectedTextColor = '#FFFFFF';
  const normalTextColor = colors.text;

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.chip,
        animatedStyle,
        {
          backgroundColor: isSelected ? selectedBackgroundColor : backgroundColor,
          borderColor: isSelected ? colors.accent : 'transparent',
        },
      ]}
      activeOpacity={0.8}
    >
      <Text style={styles.emoji}>{emoji}</Text>
      <Text
        style={[
          styles.label,
          {
            color: isSelected ? selectedTextColor : normalTextColor,
            fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium',
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
  },
});
