import React, { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassContainer } from '@/components/glass/GlassContainer';

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
    <GlassContainer borderRadius={16} style={styles.card}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {children}
    </GlassContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
});
