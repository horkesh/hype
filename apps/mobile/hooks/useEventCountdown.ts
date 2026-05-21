import { useEffect, useState } from 'react';

type Language = 'bs' | 'en' | string;

interface CountdownResult {
  label: string | null;
  isHappeningNow: boolean;
}

function computeCountdown(startDatetime: string, language: Language): CountdownResult {
  const now = new Date();
  const start = new Date(startDatetime);
  const diffMs = start.getTime() - now.getTime();
  const diffMin = Math.round(diffMs / 60_000);

  // Already started (within last 2 hours) → "happening now"
  if (diffMin < 0 && diffMin > -120) {
    return {
      label: language === 'bs' ? 'U toku' : 'Happening now',
      isHappeningNow: true,
    };
  }

  // More than 3 hours away or already ended → null
  if (diffMin < 0 || diffMin > 180) {
    return { label: null, isHappeningNow: false };
  }

  // Within 3 hours
  if (diffMin <= 1) {
    return {
      label: language === 'bs' ? 'Počinje sada' : 'Starting now',
      isHappeningNow: false,
    };
  }

  if (diffMin < 60) {
    const text =
      language === 'bs'
        ? `Počinje za ${diffMin} min`
        : `Starts in ${diffMin} min`;
    return { label: text, isHappeningNow: false };
  }

  const hours = Math.floor(diffMin / 60);
  const remainingMin = diffMin % 60;

  if (remainingMin === 0) {
    const text =
      language === 'bs'
        ? `Počinje za ${hours}h`
        : `Starts in ${hours}h`;
    return { label: text, isHappeningNow: false };
  }

  const text =
    language === 'bs'
      ? `Počinje za ${hours}h ${remainingMin}min`
      : `Starts in ${hours}h ${remainingMin}min`;
  return { label: text, isHappeningNow: false };
}

/**
 * Returns a live countdown string for events starting within the next 3 hours.
 * Updates every 60 seconds. Returns null if the event is >3h away or >2h past.
 */
export function useEventCountdown(
  startDatetime: string,
  language: Language
): CountdownResult {
  const [result, setResult] = useState<CountdownResult>(() =>
    computeCountdown(startDatetime, language)
  );

  useEffect(() => {
    // Recompute immediately when inputs change
    setResult(computeCountdown(startDatetime, language));

    const interval = setInterval(() => {
      setResult(computeCountdown(startDatetime, language));
    }, 60_000);

    return () => clearInterval(interval);
  }, [startDatetime, language]);

  return result;
}
