import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface TonightEventMetaProps {
  eventMetaSeparator: string;
  eventTime: string;
  textSecondaryColor: string;
  venueName: string;
}

export function TonightEventMeta({
  eventMetaSeparator,
  eventTime,
  textSecondaryColor,
  venueName,
}: TonightEventMetaProps) {
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaText, { color: textSecondaryColor }]}>{eventTime}</Text>
      {venueName ? (
        <>
          <Text style={[styles.metaText, { color: textSecondaryColor }]}>{eventMetaSeparator}</Text>
          <Text style={[styles.metaText, { color: textSecondaryColor }]} numberOfLines={1}>
            {venueName}
          </Text>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 14,
  },
});
