import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

interface HomeCardRailProps {
  children: React.ReactNode;
}

export function HomeCardRail({ children }: HomeCardRailProps) {
  if (Platform.OS === 'web') {
    return <View style={styles.webStack}>{children}</View>;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rail: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  webStack: {
    paddingHorizontal: 20,
    gap: 16,
  },
});
