
import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform, Linking } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { IconSymbol } from './IconSymbol';

const visitSarajevoLogo = require('@/assets/visit-sarajevo.png');

const VISIT_SARAJEVO_URL_EN = 'https://www.visitsarajevo.ba/';
const VISIT_SARAJEVO_URL_BS = 'https://www.visitsarajevo.ba/bs/pocetna/';

export function HypeHeader() {
  const { language, setLanguage } = useApp();
  const { colors } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    setLanguage(language === 'bs' ? 'en' : 'bs');
  };

  const languageLabel = language === 'bs' ? 'BS' : 'EN';

  // Show back button on detail pages (venue, event, series)
  const isDetailPage = /^\/(venue|event|series)\//.test(pathname);
  const canGoBack = router.canGoBack();
  const showBack = isDetailPage && canGoBack;

  const visitUrl = language === 'bs' ? VISIT_SARAJEVO_URL_BS : VISIT_SARAJEVO_URL_EN;

  return (
    <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
      <View style={styles.headerLeft}>
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => {
            if (pathname !== '/') {
              router.push('/');
            }
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.logo, { color: colors.accent }]}>Look</Text>
          <Text style={[styles.logoCity, { color: colors.textSecondary }]}> - Sarajevo</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.visitLogoContainer}
        onPress={() => Linking.openURL(visitUrl)}
        activeOpacity={0.7}
      >
        <Image source={visitSarajevoLogo} style={styles.visitLogo} resizeMode="contain" />
      </TouchableOpacity>

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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButton: {
    padding: 4,
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
  visitLogoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitLogo: {
    height: 32,
    width: 100,
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
    fontFamily: 'DMSans_500Medium',
  },
  notificationButton: {
    padding: 4,
  },
});
