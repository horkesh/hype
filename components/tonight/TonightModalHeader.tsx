import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TonightModalHeaderProps {
  closeLabel: string;
  color: string;
  onClose: () => void;
  title: string;
}

export function TonightModalHeader({
  closeLabel,
  color,
  onClose,
  title,
}: TonightModalHeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={[styles.title, { color }]}>{title}</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={[styles.close, { color }]}>{closeLabel}</Text>
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
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  close: {
    fontSize: 28,
    fontWeight: '300',
  },
});
