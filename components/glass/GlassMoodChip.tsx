import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';
import type { MoodId } from '@/styles/glassTokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const MOOD_ICONS: Record<MoodId, { library: 'mci' | 'ion'; name: string }> = {
  party:       { library: 'mci', name: 'party-popper' },
  chill:       { library: 'mci', name: 'moon-waning-crescent' },
  girls_night: { library: 'mci', name: 'glass-cocktail' },
  date_night:  { library: 'mci', name: 'candle' },
  muzika:      { library: 'ion', name: 'musical-notes' },
  romantika:   { library: 'ion', name: 'heart' },
  kultura:     { library: 'mci', name: 'drama-masks' },
  foodie:      { library: 'mci', name: 'silverware-fork-knife' },
  brunch:      { library: 'mci', name: 'coffee' },
  after_work:  { library: 'mci', name: 'beer' },
  outdoor:     { library: 'ion', name: 'leaf' },
  turista:     { library: 'mci', name: 'compass' },
};

function MoodIcon({ moodId, color, size }: { moodId: MoodId; color: string; size: number }) {
  const icon = MOOD_ICONS[moodId];
  if (!icon) return null;

  if (icon.library === 'ion') {
    return <Ionicons name={icon.name as any} size={size} color={color} style={styles.icon} />;
  }
  return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} style={styles.icon} />;
}

interface GlassMoodChipProps {
  moodId: MoodId;
  label: string;
  isSelected: boolean;
  onPress: () => void;
}

export function GlassMoodChip({
  moodId,
  label,
  isSelected,
  onPress,
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
  const iconColor = isSelected ? '#FFFFFF' : (mood?.primary ?? colors.accent);

  const chipStyle = [
    styles.chip,
    { backgroundColor: chipBg, borderColor, ...glowShadow },
  ];

  const content = (
    <>
      <MoodIcon moodId={moodId} color={iconColor} size={18} />
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
      <TouchableOpacity
        onPress={onPress}
        style={chipStyle}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ selected: isSelected }}
      >
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
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
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
    marginRight: 6,
  },
  label: {
    fontSize: 14,
  },
});
