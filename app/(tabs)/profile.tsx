
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { useTheme } from '@/hooks/useTheme';
import { HypeHeader } from '@/components/HypeHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MOODS = [
  { id: 'party', emoji: '🎉', label_bs: 'Party', label_en: 'Party' },
  { id: 'chill', emoji: '😌', label_bs: 'Chill', label_en: 'Chill' },
  { id: 'girls_night', emoji: '👯', label_bs: 'Girls Night', label_en: 'Girls Night' },
  { id: 'date_night', emoji: '💑', label_bs: 'Date Night', label_en: 'Date Night' },
  { id: 'music', emoji: '🎵', label_bs: 'Muzika', label_en: 'Music' },
  { id: 'romance', emoji: '💕', label_bs: 'Romantika', label_en: 'Romance' },
  { id: 'culture', emoji: '🎭', label_bs: 'Kultura', label_en: 'Culture' },
  { id: 'foodie', emoji: '🍽️', label_bs: 'Foodie', label_en: 'Foodie' },
  { id: 'brunch', emoji: '🥐', label_bs: 'Brunch', label_en: 'Brunch' },
  { id: 'after_work', emoji: '🍻', label_bs: 'After Work', label_en: 'After Work' },
  { id: 'outdoor', emoji: '🌳', label_bs: 'Outdoor', label_en: 'Outdoor' },
  { id: 'tourist', emoji: '📸', label_bs: 'Turista', label_en: 'Tourist' },
];

// Demo earned badges (for demo purposes)
const DEMO_EARNED_BADGES = [
  { icon: '☕', name_bs: 'Kafedžija', name_en: 'Coffee Lover' },
  { icon: '🕵️', name_bs: 'Explorer', name_en: 'Explorer' },
  { icon: '👑', name_bs: 'Hype OG', name_en: 'Hype OG' },
];

export default function ProfileScreen() {
  const { t, themeMode, setThemeMode, language, setLanguage } = useApp();
  const { colors } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  useEffect(() => {
    checkUser();
    loadTasteProfile();
  }, []);

  const checkUser = async () => {
    console.log('Checking user session');
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTasteProfile = async () => {
    try {
      const saved = await AsyncStorage.getItem('taste_profile');
      if (saved) {
        setSelectedMoods(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading taste profile:', error);
    }
  };

  const saveTasteProfile = async (moods: string[]) => {
    try {
      await AsyncStorage.setItem('taste_profile', JSON.stringify(moods));
      console.log('Taste profile saved:', moods);
    } catch (error) {
      console.error('Error saving taste profile:', error);
    }
  };

  const toggleMood = (moodId: string) => {
    const newMoods = selectedMoods.includes(moodId)
      ? selectedMoods.filter(id => id !== moodId)
      : [...selectedMoods, moodId];
    setSelectedMoods(newMoods);
    saveTasteProfile(newMoods);
  };

  const handleSignIn = async () => {
    console.log('Signing in with email:', email);
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        alert(error.message);
        return;
      }

      setUser(data.user);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign in error:', error);
      alert(error.message || 'Failed to sign in');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    console.log('Signing up with email:', email);
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        alert(error.message);
        return;
      }

      alert('Check your email for the confirmation link!');
      setIsSignUp(false);
      setEmail('');
      setPassword('');
    } catch (error: any) {
      console.error('Sign up error:', error);
      alert(error.message || 'Failed to sign up');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    console.log('Signing out');
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowSignOutModal(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleThemeChange = (mode: 'auto' | 'light' | 'dark') => {
    console.log('Changing theme to:', mode);
    setThemeMode(mode);
  };

  const toggleLanguage = () => {
    const newLang = language === 'bs' ? 'en' : 'bs';
    console.log('Toggling language to:', newLang);
    setLanguage(newLang);
  };

  const themeModes: { value: 'auto' | 'light' | 'dark'; label_bs: string; label_en: string }[] = [
    { value: 'auto', label_bs: 'Automatski', label_en: 'Auto' },
    { value: 'light', label_bs: 'Svijetla', label_en: 'Light' },
    { value: 'dark', label_bs: 'Tamna', label_en: 'Dark' },
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <HypeHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const badgeCountText = language === 'bs' ? 'Bedževa' : 'Badges';
  const earnedBadgeCount = DEMO_EARNED_BADGES.length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <HypeHeader />
      <ScrollView style={styles.content}>
        {!user ? (
          <View style={styles.authSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {isSignUp ? 'Registracija' : 'Prijava'}
            </Text>
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <TouchableOpacity
                onPress={isSignUp ? handleSignUp : handleSignIn}
                style={[styles.authButton, { backgroundColor: colors.accent }]}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.authButtonText}>
                    {isSignUp ? 'Registruj se' : 'Prijavi se'}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                <Text style={[styles.switchText, { color: colors.accent }]}>
                  {isSignUp ? 'Već imaš nalog? Prijavi se' : 'Nemaš nalog? Registruj se'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.userSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Nalog</Text>
            <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.emailText, { color: colors.text }]}>{user.email}</Text>
              
              <View style={styles.badgesSection}>
                <View style={styles.badgeCountRow}>
                  <Text style={[styles.badgeCountNumber, { color: colors.accent }]}>
                    {earnedBadgeCount}
                  </Text>
                  <Text style={[styles.badgeCountLabel, { color: colors.textSecondary }]}>
                    {badgeCountText}
                  </Text>
                </View>
                <View style={styles.topBadgesRow}>
                  {DEMO_EARNED_BADGES.slice(0, 3).map((badge, index) => (
                    <View key={index} style={[styles.topBadge, { backgroundColor: colors.background }]}>
                      <Text style={styles.topBadgeIcon}>{badge.icon}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setShowSignOutModal(true)}
                style={[styles.signOutButton, { borderColor: colors.accent }]}
              >
                <Text style={[styles.signOutButtonText, { color: colors.accent }]}>
                  Odjavi se
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Šta te zanima?
          </Text>
          <View style={styles.moodGrid}>
            {MOODS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id);
              const label = language === 'bs' ? mood.label_bs : mood.label_en;
              return (
                <TouchableOpacity
                  key={mood.id}
                  onPress={() => toggleMood(mood.id)}
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.cardBackground,
                      borderColor: colors.accent,
                    }
                  ]}
                >
                  <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                  <Text style={[
                    styles.moodLabel,
                    { color: isSelected ? '#FFFFFF' : colors.text }
                  ]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Postavke
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Jezik / Language
            </Text>
            <View style={styles.languageToggle}>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: language === 'bs' ? colors.accent : colors.background,
                    borderColor: colors.accent,
                  }
                ]}
              >
                <Text style={[
                  styles.languageButtonText,
                  { color: language === 'bs' ? '#FFFFFF' : colors.text }
                ]}>
                  BS
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={toggleLanguage}
                style={[
                  styles.languageButton,
                  {
                    backgroundColor: language === 'en' ? colors.accent : colors.background,
                    borderColor: colors.accent,
                  }
                ]}
              >
                <Text style={[
                  styles.languageButtonText,
                  { color: language === 'en' ? '#FFFFFF' : colors.text }
                ]}>
                  EN
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Tema / Theme
            </Text>
            <View style={styles.themeOptions}>
              {themeModes.map((mode) => {
                const isSelected = themeMode === mode.value;
                const label = language === 'bs' ? mode.label_bs : mode.label_en;
                return (
                  <TouchableOpacity
                    key={mode.value}
                    onPress={() => handleThemeChange(mode.value)}
                    style={[
                      styles.themeButton,
                      { 
                        backgroundColor: isSelected ? colors.accent : colors.background,
                        borderColor: colors.accent,
                      }
                    ]}
                  >
                    <Text style={[
                      styles.themeButtonText,
                      { color: isSelected ? '#FFFFFF' : colors.text }
                    ]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              O aplikaciji
            </Text>
            <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
              Hype v1.0 — Digitalni puls grada
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showSignOutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSignOutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Odjavi se?
            </Text>
            <Text style={[styles.modalText, { color: colors.textSecondary }]}>
              Da li si siguran/na da želiš da se odjaviš?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowSignOutModal(false)}
                style={[styles.modalButton, { backgroundColor: colors.background }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>
                  Otkaži
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSignOut}
                style={[styles.modalButton, { backgroundColor: colors.accent }]}
              >
                <Text style={[styles.modalButtonText, { color: '#FFFFFF' }]}>
                  Odjavi se
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  authSection: {
    padding: 20,
  },
  userSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
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
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  authButton: {
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  switchText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
  },
  emailText: {
    fontSize: 16,
    marginBottom: 16,
  },
  badgesSection: {
    marginBottom: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.2)',
  },
  badgeCountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 12,
  },
  badgeCountNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  badgeCountLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  topBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  topBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  topBadgeIcon: {
    fontSize: 24,
  },
  signOutButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  moodChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
  },
  moodEmoji: {
    fontSize: 18,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  languageToggle: {
    flexDirection: 'row',
    gap: 8,
  },
  languageButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  themeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
