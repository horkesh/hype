import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Map } from '@/components/Map';
import { TonightPlannerActionRow } from '@/components/tonight/TonightPlannerActionRow';
import { TonightPlanStopList } from '@/components/tonight/TonightPlanStopList';
import {
  buildTonightPlannerStopRows,
  TONIGHT_PLAN_REGION,
} from '@/utils/tonightPlanner';
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
  const stopRows = buildTonightPlannerStopRows(activePlan);

  return (
    <>
      <TonightPlanStopList
        cardColor={cardColor}
        colorsText={colorsText}
        rows={stopRows}
      />

      <View style={[styles.planTotal, { backgroundColor: cardColor }]}>
        <Text style={[styles.planTotalLabel, { color: colorsText }]}>{plannerLabels.total}</Text>
        <Text style={styles.planTotalAmount}>~{activePlan.total} KM</Text>
      </View>

      {mapMarkers.length > 0 ? (
        <View style={styles.planMap}>
          <Map markers={mapMarkers} initialRegion={TONIGHT_PLAN_REGION} />
        </View>
      ) : null}

      <TonightPlannerActionRow
        cardColor={cardColor}
        labels={plannerLabels}
        onNextPlan={onNextPlan}
        onSavePlan={onSavePlan}
        onSharePlan={onSharePlan}
      />
    </>
  );
}

const styles = StyleSheet.create({
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
});
