export const WEB_APP_MAX_WIDTH = 430;

export interface ResponsiveColumnLayoutOptions {
  viewportWidth: number;
  platform: string;
  minCardWidth?: number;
  maxColumns?: number;
  maxContentWidth?: number;
  gap?: number;
  horizontalPadding?: number;
}

export interface ResponsiveColumnLayout {
  columns: number;
  gap: number;
  contentWidth: number;
}

export function getEffectiveAppWidth(viewportWidth: number, platform: string): number {
  return platform === 'web' ? Math.min(viewportWidth, WEB_APP_MAX_WIDTH) : viewportWidth;
}

export function getResponsiveColumnLayout({
  viewportWidth,
  platform,
  minCardWidth = 300,
  maxColumns = 4,
  maxContentWidth = 1200,
  gap = 16,
  horizontalPadding = 32,
}: ResponsiveColumnLayoutOptions): ResponsiveColumnLayout {
  const effectiveWidth = getEffectiveAppWidth(viewportWidth, platform);
  const contentWidth = Math.max(0, Math.min(effectiveWidth, maxContentWidth) - horizontalPadding);
  const columns = Math.max(
    1,
    Math.min(maxColumns, Math.floor((contentWidth + gap) / (minCardWidth + gap))),
  );

  return { columns, gap, contentWidth };
}
