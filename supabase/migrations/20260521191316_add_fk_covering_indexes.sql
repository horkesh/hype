-- P5: cover the three hot-path FKs called out by the audit. Each enables an
-- index lookup instead of a sequential scan when joining or filtering by the
-- foreign key. Low cost (events table is ~120 rows today) but worth doing
-- before traffic ramps.
CREATE INDEX IF NOT EXISTS audit_log_reverted_by_idx
  ON public.audit_log (reverted_by)
  WHERE reverted_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS events_review_requested_by_idx
  ON public.events (review_requested_by)
  WHERE review_requested_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS events_submitted_by_idx
  ON public.events (submitted_by)
  WHERE submitted_by IS NOT NULL;
