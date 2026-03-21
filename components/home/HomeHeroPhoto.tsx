import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { designTokens } from '@/styles/designTokens';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_MIN_HEIGHT = 320;

// Hero images — will be replaced with Gemini-generated assets
const HERO_IMAGES: Record<string, any> = {
  morning: null,
  afternoon: null,
  evening: null,
  night: null,
};

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

function getGreeting(timeOfDay: string, language: string): string {
  const greetings: Record<string, Record<string, string>> = {
    morning:   { bs: 'Dobro jutro, Sarajevo', en: 'Good morning, Sarajevo' },
    afternoon: { bs: 'Dobar dan, Sarajevo', en: 'Good afternoon, Sarajevo' },
    evening:   { bs: 'Šta radimo večeras?', en: 'What are we doing tonight?' },
    night:     { bs: 'Sarajevo ne spava', en: 'Sarajevo never sleeps' },
  };
  return greetings[timeOfDay]?.[language] ?? greetings.evening.en;
}

interface HomeHeroPhotoProps {
  language: string;
  children?: React.ReactNode;
}

export function HomeHeroPhoto({ language, children }: HomeHeroPhotoProps) {
  const timeOfDay = getTimeOfDay();
  const greeting = getGreeting(timeOfDay, language);
  const heroImage = HERO_IMAGES[timeOfDay];

  return (
    <View style={styles.container}>
      {heroImage ? (
        <Image source={heroImage} style={styles.backgroundImage} />
      ) : (
        <LinearGradient
          colors={['#D4A056', '#121212']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backgroundImage}
        />
      )}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.overlay}
      >
        <Text style={styles.greeting}>{greeting}</Text>
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: SCREEN_WIDTH, minHeight: HERO_MIN_HEIGHT, marginBottom: 16 },
  backgroundImage: { ...StyleSheet.absoluteFillObject, width: SCREEN_WIDTH, minHeight: HERO_MIN_HEIGHT },
  overlay: { justifyContent: 'flex-end', padding: 20, paddingBottom: 24, minHeight: HERO_MIN_HEIGHT },
  greeting: { ...designTokens.typography.heroTitle, color: '#FFF', marginBottom: 12 },
});
