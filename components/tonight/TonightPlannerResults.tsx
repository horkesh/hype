import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Map } from '@/components/Map';
import { AIPlan } from '@/utils/tonightScreen';

interface TonightPlannerResultsProps {
  activePlan: AIPlan;
  cardColor: string;
  colorsText: string;
  mapMarkers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title: string;
  }>;
  plannerLabels: {
    nextPlan: string;
    save: string;
    share: string;
    total: string;
  };
  onNextPlan: () => void;
  onSavePlan: () => void;
  onSharePlan: () => void;
}

export function TonightPlannerResults({
  activePlan,
  cardColor,
  colorsText,
  mapMarkers,
  plannerLabels,
  onNextPlan,
  onSavePlan,
  onSharePlan,
}: TonightPlannerResultsProps) {
  return (
    <>
      <View style={styles.planStops}>
        {activePlan.stops.map((stop, index) => (
          <View key={`${stop.venueName}-${stop.time}-${index}`} style={[styles.planStop, { backgroundColor: cardColor }]}>
            <Text style={styles.planStopTime}>{stop.time}</Text>
            <Text style={[styles.planStopVenue, { color: colorsText }]}>{stop.venueName}</Text>
            <Text style={styles.planStopActivity}>{stop.activity}</Text>
            <Text style={[styles.planStopPrice, { color: colorsText }]}>~{stop.price} KM</Text>
          </View>
        ))}
      </View>

      <View style={[styles.planTotal, { backgroundColor: cardColor }]}>
        <Text style={[styles.planTotalLabel, { color: colorsText }]}>{plannerLabels.total}</Text>
        <Text style={styles.planTotalAmount}>~{activePlan.total} KM</Text>
      </View>

      {mapMarkers.length > 0 ? (
        <View style={styles.planMap}>
          <Map
            markers={mapMarkers}
            initialRegion={{
              latitude: 43.8563,
              longitude: 18.4131,
              latitudeDelta: 0.03,
              longitudeDelta: 0.03,
            }}
          />
        </View>
      ) : null}

      <View style={styles.planActions}>
        <TouchableOpacity
          style={[styles.planActionButton, styles.secondaryAction, { backgroundColor: cardColor }]}
          onPress={onNextPlan}
        >
          <Text style={styles.secondaryActionText}>{plannerLabels.nextPlan}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planActionButton, styles.secondaryAction, { backgroundColor: cardColor }]}
          onPress={onSavePlan}
        >
          <Text style={styles.secondaryActionText}>{plannerLabels.save}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.planActionButton, { backgroundColor: '#D4A056' }]}
          onPress={onSharePlan}
        >
          <Text style={styles.primaryActionText}>{plannerLabels.share}</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  planStops: {
    gap: 12,
  },
  planStop: {
    padding: 16,
    borderRadius: 16,
  },
  planStopTime: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#D4A056',
  },
  planStopVenue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  planStopActivity: {
    fontSize: 14,
    marginBottom: 4,
    color: '#6B7280',
  },
  planStopPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  planTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  planTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  planTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4A056',
  },
  planMap: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 16,
  },
  planActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  planActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  secondaryAction: {
    borderWidth: 1,
    borderColor: '#D4A056',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4A056',
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
