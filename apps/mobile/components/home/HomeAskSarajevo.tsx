import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { askSarajevo, type AskSarajevoResult } from '@/utils/ai/askSarajevo';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { designTokens } from '@/styles/designTokens';
import type { HomeLanguage } from '@/utils/homeScreenContent';

interface Props {
  language: HomeLanguage;
  colors: { accent: string; card: string; text: string; textSecondary: string };
}

export function HomeAskSarajevo({ language, colors }: Props) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskSarajevoResult | null>(null);
  const router = useRouter();

  const handleAsk = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await askSarajevo(query.trim(), language);
      setResult(res);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const answer = result
    ? (language === 'bs' ? result.answer_bs : result.answer_en)
    : null;

  return (
    <View style={styles.container}>
      <GlassContainer style={styles.glass}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="chat-question-outline" size={20} color={colors.accent} />
          <Text style={[styles.title, { color: colors.text }]}>
            {language === 'bs' ? 'Pitaj Sarajevo' : 'Ask Sarajevo'}
          </Text>
          <GlassBadge label="AI" variant="accent" size="sm" />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: 'rgba(212,160,86,0.2)' }]}
            placeholder={language === 'bs' ? 'Pitaj bilo šta o Sarajevu...' : 'Ask anything about Sarajevo...'}
            placeholderTextColor="rgba(255,255,255,0.3)"
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleAsk}
            returnKeyType="search"
          />
          <TouchableOpacity onPress={handleAsk} style={[styles.sendBtn, { backgroundColor: colors.accent }]} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <MaterialCommunityIcons name="send" size={18} color="#000" />
            )}
          </TouchableOpacity>
        </View>

        {answer && (
          <View style={styles.answer}>
            <Text style={[styles.answerText, { color: colors.text }]}>{answer}</Text>

            {result?.mentioned_venues && result.mentioned_venues.length > 0 && (
              <View style={styles.venueLinks}>
                {result.mentioned_venues.map((v) => (
                  <TouchableOpacity
                    key={v.venue_id}
                    onPress={() => router.push(`/venue/${v.venue_id}` as any)}
                    style={styles.venueLink}
                  >
                    <MaterialCommunityIcons name="map-marker" size={14} color={colors.accent} />
                    <Text style={[styles.venueLinkText, { color: colors.accent }]}>{v.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={styles.attribution}>
              {language === 'bs' ? 'Izvor: Visit Sarajevo' : 'Source: Visit Sarajevo'}
            </Text>
          </View>
        )}
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  glass: { padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontFamily: 'DMSans_700Bold',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  answer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  answerText: {
    fontSize: 14,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 20,
  },
  venueLinks: {
    marginTop: 8,
    gap: 4,
  },
  venueLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  venueLinkText: {
    fontSize: 13,
    fontFamily: 'DMSans_500Medium',
  },
  attribution: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 8,
    textAlign: 'right',
  },
});
