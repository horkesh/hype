-- RECOVERED 2026-08-22 from supabase_migrations.schema_migrations on the live
-- project (kyfoqltmkqwtnrdlacqv). This migration was applied to the database but
-- had no file in the repo, so a rebuild from git alone would have produced
-- event_series and venues without their festival / watch-party columns.
-- Reproduced verbatim as applied.

ALTER TABLE event_series
  ADD COLUMN IF NOT EXISTS parent_series_id uuid REFERENCES event_series(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_major boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS home_priority integer,
  ADD COLUMN IF NOT EXISTS series_kind text NOT NULL DEFAULT 'festival',
  ADD COLUMN IF NOT EXISTS track_label_bs text,
  ADD COLUMN IF NOT EXISTS track_label_en text,
  ADD COLUMN IF NOT EXISTS venue_area_bs text,
  ADD COLUMN IF NOT EXISTS venue_area_en text;

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS is_watch_party_venue boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS watch_party_note_bs text,
  ADD COLUMN IF NOT EXISTS watch_party_note_en text;
