import { Platform, useWindowDimensions } from 'react-native';

import { getResponsiveColumnLayout } from '@/utils/webLayout';

/**
 * Responsive column count for card grids on the web/desktop build.
 *
 * Mobile-first: on phone widths this returns 1 (unchanged single-column feel);
 * as the viewport grows it adds columns, targeting a comfortable card width.
 * Content is also capped at `maxContentWidth` so ultra-wide screens center
 * rather than stretching cards forever.
 */
export interface ResponsiveColumns {
  /** Number of columns to render. */
  columns: number;
  /** Gap (px) to use between columns and rows. */
  gap: number;
  /** Usable content width (px) after padding + max-width cap. */
  contentWidth: number;
}

interface Options {
  /** Smallest comfortable card width before adding a column. */
  minCardWidth?: number;
  /** Hard cap on columns. */
  maxColumns?: number;
  /** Cap the content width so huge monitors center instead of stretching. */
  maxContentWidth?: number;
  /** Gap between cards. */
  gap?: number;
  /** Total horizontal padding around the grid (both sides combined). */
  horizontalPadding?: number;
}

export function useResponsiveColumns(options: Options = {}): ResponsiveColumns {
  const { width } = useWindowDimensions();

  return getResponsiveColumnLayout({
    viewportWidth: width,
    platform: Platform.OS,
    ...options,
  });
}
