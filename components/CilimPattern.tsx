
import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

export function CilimPattern() {
  return (
    <View style={styles.container}>
      <Svg width="100%" height="100%" viewBox="0 0 400 100" preserveAspectRatio="xMidYMid slice">
        <G opacity="0.05">
          {/* Geometric pattern inspired by Bosnian ćilim rugs */}
          <Path
            d="M0,50 L20,30 L40,50 L20,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M40,50 L60,30 L80,50 L60,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M80,50 L100,30 L120,50 L100,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M120,50 L140,30 L160,50 L140,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M160,50 L180,30 L200,50 L180,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M200,50 L220,30 L240,50 L220,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M240,50 L260,30 L280,50 L260,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M280,50 L300,30 L320,50 L300,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M320,50 L340,30 L360,50 L340,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          <Path
            d="M360,50 L380,30 L400,50 L380,70 Z"
            stroke="#D4A056"
            strokeWidth="1"
            fill="none"
          />
          
          {/* Vertical lines */}
          <Path d="M20,20 L20,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M60,20 L60,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M100,20 L100,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M140,20 L140,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M180,20 L180,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M220,20 L220,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M260,20 L260,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M300,20 L300,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M340,20 L340,80" stroke="#D4A056" strokeWidth="1" />
          <Path d="M380,20 L380,80" stroke="#D4A056" strokeWidth="1" />
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    overflow: 'hidden',
  },
});
