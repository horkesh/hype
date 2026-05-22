
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
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

const MOOD_COLORS: Record<string, string> = {
  party: 'rgba(239, 68, 68, 0.25)',
  chill: 'rgba(59, 130, 246, 0.25)',
  girls_night: 'rgba(236, 72, 153, 0.25)',
  date_night: 'rgba(251, 146, 60, 0.25)',
  muzika: 'rgba(168, 85, 247, 0.25)',
  romantika: 'rgba(190, 18, 60, 0.25)',
  kultura: 'rgba(99, 102, 241, 0.25)',
  foodie: 'rgba(234, 179, 8, 0.25)',
  brunch: 'rgba(251, 207, 232, 0.2)',
  after_work: 'rgba(217, 119, 6, 0.25)',
  outdoor: 'rgba(34, 197, 94, 0.25)',
  turista: 'rgba(14, 165, 233, 0.25)',
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

  const backgroundColor = MOOD_COLORS[moodId] || 'rgba(255, 255, 255, 0.1)';

  const selectedBackgroundColor = colors.accent;
  const selectedTextColor = '#FFFFFF';
  const normalTextColor = colors.text;
  const chipStyle = [
    styles.chip,
    {
      backgroundColor: isSelected ? selectedBackgroundColor : backgroundColor,
      borderColor: isSelected ? colors.accent : 'transparent',
    },
  ];

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={chipStyle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isSelected }}
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
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        chipStyle,
      ]}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
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
