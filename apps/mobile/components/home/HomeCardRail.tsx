import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface HomeCardRailProps {
  children: React.ReactNode;
}

export function HomeCardRail({ children }: HomeCardRailProps) {
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
});
