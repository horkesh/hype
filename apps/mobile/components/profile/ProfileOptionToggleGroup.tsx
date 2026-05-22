import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ProfileOptionToggleGroupProps<T extends string> {
  accentColor: string;
  backgroundColor: string;
  options: Array<{ label: string; value: T }>;
  selectedValue: T;
  textColor: string;
  onSelect: (value: T) => void;
}

export function ProfileOptionToggleGroup<T extends string>({
  accentColor,
  backgroundColor,
  options,
  selectedValue,
  textColor,
  onSelect,
}: ProfileOptionToggleGroupProps<T>) {
  return (
    <View style={styles.row}>
      {options.map((option) => {
        const isSelected = selectedValue === option.value;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => onSelect(option.value)}
            style={[
              styles.button,
              {
                backgroundColor: isSelected ? accentColor : backgroundColor,
                borderColor: accentColor,
              },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? '#FFFFFF' : textColor }]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});
