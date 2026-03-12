import { AIPlan, MoodId, TONIGHT_MOODS } from '@/utils/tonightScreen';

export interface TonightPlannerMoodOption {
  id: MoodId;
  emoji: string;
  label: string;
}

export interface TonightPlannerStopRow {
  id: string;
  activity: string;
  priceText: string;
  time: string;
  venueName: string;
}

export const TONIGHT_GROUP_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

export const TONIGHT_PLAN_REGION = {
  latitude: 43.8563,
  longitude: 18.4131,
  latitudeDelta: 0.03,
  longitudeDelta: 0.03,
};

export function buildTonightPlannerMoodOptions(isBosnian: boolean): TonightPlannerMoodOption[] {
  return TONIGHT_MOODS.map((mood) => ({
    id: mood.id,
    emoji: mood.emoji,
    label: isBosnian ? mood.label_bs : mood.label_en,
  }));
}

export function buildTonightPlannerStopRows(activePlan: AIPlan): TonightPlannerStopRow[] {
  return activePlan.stops.map((stop, index) => ({
    id: `${stop.venueName}-${stop.time}-${index}`,
    activity: stop.activity,
    priceText: `~${stop.price} KM`,
    time: stop.time,
    venueName: stop.venueName,
  }));
}
