export function parseIngestionLimitParam(value: string | undefined, fallback = 25): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(1, Math.min(Math.trunc(parsed), 100));
}

export function buildIngestionRunErrorResult(
  sourceId: string | null,
  logId: string | null,
  message: string,
) {
  return {
    status: 'error' as const,
    message,
    sourceId,
    logId,
  };
}
