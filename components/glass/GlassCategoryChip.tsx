import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Platform, Image, ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useTheme } from '@/hooks/useTheme';
import { glassTokens } from '@/styles/glassTokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface GlassCategoryChipProps {
  categoryId: string;
  label: string;
  isSelected: boolean;
  onPress: () => void;
  iconSource?: ImageSourcePropType;
}

export function GlassCategoryChip({ categoryId, label, isSelected, onPress, iconSource }: GlassCategoryChipProps) {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const chipBg = isSelected ? colors.accent : glassTokens.background;
  const borderColor = isSelected ? colors.accent : glassTokens.border;
  const textColor = isSelected ? '#FFF' : colors.text;
  const content = (
    <>
      {iconSource ? (
        <Image source={iconSource} style={styles.icon} />
      ) : (
        <View style={[styles.iconPlaceholder, { backgroundColor: colors.accent }]} />
      )}
      <Text style={[styles.label, { color: textColor, fontFamily: isSelected ? 'DMSans_700Bold' : 'DMSans_500Medium' }]}>
        {label}
      </Text>
    </>
  );
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.chip, { backgroundColor: chipBg, borderColor }]} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }
  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[animatedStyle, styles.chip, { backgroundColor: chipBg, borderColor }]}
      activeOpacity={0.8}
    >
      {content}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 24, borderWidth: 1.5, marginRight: 8, marginBottom: 8 },
  icon: { width: 18, height: 18, marginRight: 6, borderRadius: 9 },
  iconPlaceholder: { width: 18, height: 18, borderRadius: 9, marginRight: 6, opacity: 0.5 },
  label: { fontSize: 13 },
});
