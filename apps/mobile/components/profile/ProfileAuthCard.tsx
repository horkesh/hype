import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface ProfileAuthCardProps {
  accentColor: string;
  authLoading: boolean;
  backgroundColor: string;
  cardColor: string;
  email: string;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onToggleMode: () => void;
  password: string;
  placeholderTextColor: string;
  textColor: string;
  isSignUp: boolean;
}

export function ProfileAuthCard({
  accentColor,
  authLoading,
  backgroundColor,
  cardColor,
  email,
  isSignUp,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onToggleMode,
  password,
  placeholderTextColor,
  textColor,
}: ProfileAuthCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: cardColor }]}>
      <TextInput
        style={[styles.input, { backgroundColor, color: textColor }]}
        placeholder="Email"
        placeholderTextColor={placeholderTextColor}
        value={email}
        onChangeText={onChangeEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={[styles.input, { backgroundColor, color: textColor }]}
        placeholder="Password"
        placeholderTextColor={placeholderTextColor}
        value={password}
        onChangeText={onChangePassword}
        secureTextEntry
      />
      <TouchableOpacity
        onPress={onSubmit}
        style={[styles.authButton, { backgroundColor: accentColor }]}
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
      <TouchableOpacity onPress={onToggleMode}>
        <Text style={[styles.switchText, { color: accentColor }]}>
          {isSignUp ? 'Već imaš nalog? Prijavi se' : 'Nemaš nalog? Registruj se'}
        </Text>
      </TouchableOpacity>
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
});
