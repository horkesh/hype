-- "Detaljnija provjera" flag — editors can mark a venue/event for closer
-- inspection. While flagged, the row stays hidden from the public app but
-- remains visible (and editable) inside the admin panel.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS review_requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_requested_at timestamptz;

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS needs_review boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS review_notes text,
  ADD COLUMN IF NOT EXISTS review_requested_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS review_requested_at timestamptz;

CREATE INDEX IF NOT EXISTS venues_needs_review_idx
  ON public.venues (review_requested_at DESC) WHERE needs_review = true;
CREATE INDEX IF NOT EXISTS events_needs_review_idx
  ON public.events (review_requested_at DESC) WHERE needs_review = true;

-- Update public-read RLS to also require needs_review = false. Curator-tier
-- ("Venues: admin full access" / "Events: admin full access") is unaffected —
-- admin panel keeps seeing flagged items.
DROP POLICY IF EXISTS "Venues: public read" ON public.venues;
CREATE POLICY "Venues: public read" ON public.venues
  FOR SELECT
  USING (is_active = true AND needs_review = false);

DROP POLICY IF EXISTS "Events: public read" ON public.events;
CREATE POLICY "Events: public read" ON public.events
  FOR SELECT
  USING (is_active = true AND status = 'approved' AND needs_review = false);
