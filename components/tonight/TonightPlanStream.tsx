import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassContainer } from '@/components/glass/GlassContainer';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import { useTheme } from '@/hooks/useTheme';
import { EveningPlan, generatePlan, PlanStop } from '@/utils/ai/planGenerator';

type StreamPhase = 'streaming' | 'done' | 'error';

interface TonightPlanStreamProps {
  moods: string[];
  groupSize: number;
  budget: 'casual' | 'mid' | 'premium';
  language: string;
  onPlanReady?: (plan: EveningPlan) => void;
}

export function TonightPlanStream({
  moods,
  groupSize,
  budget,
  language,
  onPlanReady,
}: TonightPlanStreamProps) {
  const { colors, isDark } = useTheme();
  const [phase, setPhase] = useState<StreamPhase>('streaming');
  const [rawText, setRawText] = useState('');
  const [plan, setPlan] = useState<EveningPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleProgress = useCallback((text: string) => {
    setRawText(text);
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await generatePlan(
          { moods, groupSize, budget, language },
          handleProgress,
        );

        if (cancelled) return;

        if (result) {
          setPlan(result);
          setPhase('done');
          onPlanReady?.(result);
        } else {
          setErrorMsg('Could not generate a plan. Please try again.');
          setPhase('error');
        }
      } catch (err: any) {
        if (cancelled) return;
        setErrorMsg(err?.message || 'Unexpected error generating plan.');
        setPhase('error');
      }
    })();

    return () => {
      cancelled = true;
    };
    // Fire once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (phase === 'error') {
    return (
      <GlassContainer style={styles.errorCard}>
        <View style={styles.errorContent}>
          <Text style={[styles.errorIcon]}>!</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>{errorMsg}</Text>
        </View>
      </GlassContainer>
    );
  }

  if (phase === 'streaming') {
    return (
      <View style={styles.streamingContainer}>
        <View style={styles.badgeRow}>
          <GlassBadge label="Generating your plan..." variant="accent" size="md" />
        </View>

        {/* Shimmer placeholders */}
        <View style={styles.shimmerBlock}>
          <SkeletonLoader height={18} width="70%" style={styles.shimmerLine} />
          <SkeletonLoader height={14} width="90%" style={styles.shimmerLine} />
          <SkeletonLoader height={14} width="50%" style={styles.shimmerLine} />
          <SkeletonLoader height={18} width="65%" style={styles.shimmerLine} />
          <SkeletonLoader height={14} width="85%" style={styles.shimmerLine} />
        </View>

        {/* Raw text preview */}
        {rawText.length > 0 && (
          <GlassContainer style={styles.previewCard}>
            <Text
              style={[styles.previewText, { color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.35)' }]}
              numberOfLines={6}
            >
              {rawText.slice(-300)}
            </Text>
          </GlassContainer>
        )}
      </View>
    );
  }

  // phase === 'done'
  if (!plan) return null;

  return (
    <View style={styles.timelineContainer}>
      {plan.tagline_en || plan.tagline_bs ? (
        <Text style={[styles.tagline, { color: colors.text }]}>
          {language === 'bs' ? plan.tagline_bs || plan.tagline_en : plan.tagline_en || plan.tagline_bs}
        </Text>
      ) : null}

      {plan.stops.map((stop, index) => (
        <TimelineStop
          key={`${stop.time}-${index}`}
          stop={stop}
          isLast={index === plan.stops.length - 1}
          language={language}
          textColor={colors.text}
          isDark={isDark}
        />
      ))}

      <GlassContainer style={styles.totalCard} glowColor="#D4A056">
        <View style={styles.totalRow}>
          <Text style={[styles.totalLabel, { color: colors.text }]}>
            {language === 'bs' ? 'Ukupno' : 'Total'}
          </Text>
          <Text style={styles.totalAmount}>~{plan.total_cost} KM</Text>
        </View>
      </GlassContainer>
    </View>
  );
}

function TimelineStop({
  stop,
  isLast,
  language,
  textColor,
  isDark,
}: {
  stop: PlanStop;
  isLast: boolean;
  language: string;
  textColor: string;
  isDark: boolean;
}) {
  const activity = language === 'bs'
    ? stop.activity_bs || stop.activity_en || ''
    : stop.activity_en || stop.activity_bs || '';

  const pitch = language === 'bs'
    ? stop.pitch_bs || stop.pitch_en || ''
    : stop.pitch_en || stop.pitch_bs || '';

  return (
    <View style={styles.stopRow}>
      {/* Timeline column */}
      <View style={styles.timelineCol}>
        <View style={styles.timeDot} />
        {!isLast && <View style={[styles.timeLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }]} />}
      </View>

      {/* Card */}
      <GlassContainer style={styles.stopCard}>
        <View style={styles.stopHeader}>
          <Text style={styles.stopTime}>{stop.time}</Text>
          {stop.estimated_cost != null && (
            <Text style={styles.stopCost}>~{stop.estimated_cost} KM</Text>
          )}
        </View>
        <Text style={[styles.stopVenue, { color: textColor }]}>{stop.venue_name}</Text>
        {activity ? <Text style={[styles.stopActivity, { color: textColor, opacity: 0.7 }]}>{activity}</Text> : null}
        {pitch ? <Text style={[styles.stopPitch, { color: textColor, opacity: 0.5 }]}>{pitch}</Text> : null}
        {stop.walk_minutes != null && stop.walk_minutes > 0 && (
          <Text style={[styles.stopWalk, { color: textColor, opacity: 0.4 }]}>
            {stop.walk_minutes} min walk
          </Text>
        )}
      </GlassContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  streamingContainer: {
    gap: 16,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 4,
  },
  shimmerBlock: {
    gap: 10,
    paddingHorizontal: 4,
  },
  shimmerLine: {
    marginBottom: 0,
  },
  previewCard: {
    padding: 12,
    marginTop: 4,
  },
  previewText: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    lineHeight: 18,
  },
  errorCard: {
    padding: 20,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorIcon: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
    width: 28,
    height: 28,
    lineHeight: 28,
    textAlign: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.15)',
    overflow: 'hidden',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'DMSans_500Medium',
  },
  timelineContainer: {
    gap: 0,
    paddingTop: 8,
  },
  tagline: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  stopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    paddingTop: 16,
  },
  timeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4A056',
    zIndex: 1,
  },
  timeLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  stopCard: {
    flex: 1,
    padding: 14,
    marginBottom: 8,
  },
  stopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stopTime: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D4A056',
    fontFamily: 'DMSans_700Bold',
  },
  stopCost: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D4A056',
    fontFamily: 'DMSans_500Medium',
  },
  stopVenue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
    marginBottom: 2,
  },
  stopActivity: {
    fontSize: 13,
    fontFamily: 'DMSans_400Regular',
    marginBottom: 2,
  },
  stopPitch: {
    fontSize: 12,
    fontFamily: 'DMSans_400Regular',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  stopWalk: {
    fontSize: 11,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
  },
  totalCard: {
    padding: 16,
    marginTop: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'DMSans_700Bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4A056',
    fontFamily: 'DMSans_700Bold',
  },
});
