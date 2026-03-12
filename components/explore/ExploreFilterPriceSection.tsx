import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';

interface ExploreFilterPriceSectionProps {
  accentColor: string;
  borderColor: string;
  priceLevel: number;
  priceLevelLabel: string;
  textColor: string;
  valueLabel: string;
  onSetPriceLevel: (value: number) => void;
}

export function ExploreFilterPriceSection({
  accentColor,
  borderColor,
  priceLevel,
  priceLevelLabel,
  textColor,
  valueLabel,
  onSetPriceLevel,
}: ExploreFilterPriceSectionProps) {
  return (
    <>
      <Text style={[styles.sectionTitle, { color: textColor }]}>{priceLevelLabel}</Text>
      <View style={styles.sliderContainer}>
        <Text style={[styles.sliderValue, { color: accentColor }]}>{valueLabel}</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={4}
          step={1}
          value={priceLevel}
          onValueChange={onSetPriceLevel}
          minimumTrackTintColor={accentColor}
          maximumTrackTintColor={borderColor}
          thumbTintColor={accentColor}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
  },
  sliderContainer: {
    marginVertical: 8,
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
});
