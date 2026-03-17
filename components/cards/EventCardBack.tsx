import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { designTokens } from '@/styles/designTokens';

interface EventCardBackProps {
  title: string;
  venueName?: string;
  price?: string;
  description?: string;
  onTicket?: () => void;
}

export function EventCardBack({ title, venueName, price, description, onTicket }: EventCardBackProps) {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {venueName && <Text style={[styles.venue, { color: colors.textSecondary }]}>{venueName}</Text>}
      {price && <Text style={[styles.price, { color: colors.accent }]}>{price}</Text>}
      {description && <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={3}>{description}</Text>}
      {onTicket && (
        <TouchableOpacity onPress={onTicket} style={styles.ticketBtn}>
          <Text style={styles.ticketText}>Get Tickets</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, borderRadius: designTokens.radius.card, justifyContent: 'space-between' },
  title: { ...designTokens.typography.cardTitle, marginBottom: 6 },
  venue: { fontSize: 13, marginBottom: 4, fontFamily: 'DMSans_400Regular' },
  price: { fontSize: 15, fontWeight: '700', marginBottom: 6, fontFamily: 'DMSans_700Bold' },
  desc: { fontSize: 13, lineHeight: 18, fontFamily: 'DMSans_400Regular' },
  ticketBtn: { backgroundColor: '#D4A056', paddingVertical: 10, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  ticketText: { color: '#FFF', fontSize: 14, fontWeight: '700', fontFamily: 'DMSans_700Bold' },
});
