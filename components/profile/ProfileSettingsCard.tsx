import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ProfileSettingsCardProps extends PropsWithChildren {
  cardColor: string;
  textColor: string;
  title: string;
}

export function ProfileSettingsCard({
  cardColor,
  children,
  textColor,
  title,
}: ProfileSettingsCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
