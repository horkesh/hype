import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TonightPlannerGroupSizePickerProps {
  cardColor: string;
  colorsText: string;
  groupSize: number;
  options: number[];
  title: string;
  onSelectGroupSize: (value: number) => void;
}

export function TonightPlannerGroupSizePicker({
  cardColor,
  colorsText,
  groupSize,
  options,
  title,
  onSelectGroupSize,
}: TonightPlannerGroupSizePickerProps) {
  return (
    <>
      <Text style={[styles.sectionLabel, { color: colorsText }]}>{title}</Text>
      <View style={styles.buttons}>
        {options.map((size) => {
          const isSelected = groupSize === size;

          return (
            <TouchableOpacity
              key={size}
              style={[styles.button, { backgroundColor: isSelected ? '#D4A056' : cardColor }]}
              onPress={() => onSelectGroupSize(size)}
            >
              <Text style={[styles.text, { color: isSelected ? '#FFFFFF' : colorsText }]}>
                {size}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
