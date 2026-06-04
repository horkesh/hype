import { useWindowDimensions } from 'react-native';

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

  const minCardWidth = options.minCardWidth ?? 300;
  const maxColumns = options.maxColumns ?? 4;
  const maxContentWidth = options.maxContentWidth ?? 1200;
  const gap = options.gap ?? 16;
  const horizontalPadding = options.horizontalPadding ?? 32;

  const contentWidth = Math.min(width, maxContentWidth) - horizontalPadding;
  const columns = Math.max(
    1,
    Math.min(maxColumns, Math.floor((contentWidth + gap) / (minCardWidth + gap))),
  );

  return { columns, gap, contentWidth };
}
