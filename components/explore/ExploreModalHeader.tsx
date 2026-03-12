import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/components/IconSymbol';

interface ExploreModalHeaderProps {
  borderColor: string;
  onClose: () => void;
  textColor: string;
  title: string;
}

export function ExploreModalHeader({
  borderColor,
  onClose,
  textColor,
  title,
}: ExploreModalHeaderProps) {
  return (
    <View style={[styles.header, { borderBottomColor: borderColor }]}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <IconSymbol
          ios_icon_name="xmark"
          android_material_icon_name="close"
          size={24}
          color={textColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
