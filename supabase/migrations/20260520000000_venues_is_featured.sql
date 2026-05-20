-- Add is_featured flag to venues, matching the existing events.is_featured column.
-- Partial index speeds up the "find featured venues" Home query and keeps the
-- index tiny since featured will always be a small fraction of total rows.
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS venues_is_featured_idx ON venues (is_featured) WHERE is_featured = true;
