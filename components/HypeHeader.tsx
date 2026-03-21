
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from './IconSymbol';

export function HypeHeader() {
  const { language, setLanguage } = useApp();
  const { colors } = useTheme();

  const toggleLanguage = () => {
    console.log('Toggling language from', language);
    setLanguage(language === 'bs' ? 'en' : 'bs');
  };

  const languageLabel = language === 'bs' ? 'BS' : 'EN';

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.logoRow}>
        <Text style={[styles.logo, { color: colors.accent }]}>Look</Text>
        <Text style={[styles.logoCity, { color: colors.textSecondary }]}> - Sarajevo</Text>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity 
          onPress={toggleLanguage}
          style={[styles.languageButton, { backgroundColor: colors.card, borderColor: colors.accent }]}
        >
          <Text style={[styles.languageText, { color: colors.accent }]}>{languageLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => console.log('Notification bell tapped')}
        >
          <IconSymbol 
            ios_icon_name="bell" 
            android_material_icon_name="notifications" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 48 : 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logo: {
    fontSize: 28,
    fontFamily: 'DMSerifDisplay_400Regular',
    letterSpacing: 1,
  },
  logoCity: {
    fontSize: 16,
    fontFamily: 'DMSans_400Regular',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationButton: {
    padding: 4,
  },
});
