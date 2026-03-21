import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';
import type { MoodId } from '@/styles/glassTokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassMoodChipProps {
  moodId: MoodId;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconSource?: any;
}

export function GlassMoodChip({
  moodId,
  label,
  isSelected,
  onPress,
  iconSource,
}: GlassMoodChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const mood = glassTokens.moodColors[moodId];

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const chipBg = isSelected
    ? mood?.primary ?? colors.accent
    : mood?.bg ?? 'rgba(255,255,255,0.08)';

  const glowShadow = isSelected && mood
    ? { shadowColor: mood.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
    : {};

  const borderColor = isSelected
    ? mood?.primary ?? colors.accent
    : 'rgba(255,255,255,0.15)';

  const textColor = isSelected ? '#FFFFFF' : colors.text;

  const chipStyle = [
    styles.chip,
    { backgroundColor: chipBg, borderColor, ...glowShadow },
  ];

  const content = (
    <>
      {iconSource ? (
        <Image source={iconSource} style={styles.icon} />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: mood?.primary ?? colors.accent }]} />
      )}
      <Text
        style={[
          styles.label,
          { color: textColor, fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium' },
        ]}
      >
        {label}
      </Text>
    </>
  );

  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={chipStyle} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[animatedStyle, chipStyle]}
      activeOpacity={0.8}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 6,
    borderRadius: 10,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    opacity: 0.7,
  },
  label: {
    fontSize: 14,
  },
});
