-- Internal admin notes — collaboration scratchpad for editor/admin/super_admin.
-- Never visible to Look-app users. Three kinds: 'venue' (attached to a venue),
-- 'event' (attached to an event), 'idea' (standalone — not yet tied to a row).
--
-- Read policy: own notes for everyone curator-tier; admin+ can read all.
-- Write policy: anyone curator-tier creates their own; only author or admin+
-- can update/delete a given row.

CREATE TABLE IF NOT EXISTS public.notes (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('venue', 'event', 'idea')),
  venue_id uuid REFERENCES public.venues(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  title text,
  body text NOT NULL CHECK (length(body) > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notes_kind_target_match CHECK (
    (kind = 'venue' AND venue_id IS NOT NULL AND event_id IS NULL) OR
    (kind = 'event' AND event_id IS NOT NULL AND venue_id IS NULL) OR
    (kind = 'idea'  AND venue_id IS NULL     AND event_id IS NULL)
  )
);

CREATE INDEX IF NOT EXISTS notes_author_kind_idx
  ON public.notes (author_id, kind, created_at DESC);
CREATE INDEX IF NOT EXISTS notes_venue_idx
  ON public.notes (venue_id, created_at DESC) WHERE venue_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS notes_event_idx
  ON public.notes (event_id, created_at DESC) WHERE event_id IS NOT NULL;

CREATE OR REPLACE FUNCTION public.touch_notes_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END;
$$;
DROP TRIGGER IF EXISTS notes_updated_at ON public.notes;
CREATE TRIGGER notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_notes_updated_at();

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notes: read own" ON public.notes;
CREATE POLICY "notes: read own" ON public.notes
  FOR SELECT
  USING (
    public.is_admin_or_curator()
    AND (author_id = auth.uid() OR public.is_admin_or_above())
  );

DROP POLICY IF EXISTS "notes: insert own" ON public.notes;
CREATE POLICY "notes: insert own" ON public.notes
  FOR INSERT
  WITH CHECK (public.is_admin_or_curator() AND author_id = auth.uid());

DROP POLICY IF EXISTS "notes: update own or admin" ON public.notes;
CREATE POLICY "notes: update own or admin" ON public.notes
  FOR UPDATE
  USING (
    public.is_admin_or_curator()
    AND (author_id = auth.uid() OR public.is_admin_or_above())
  );

DROP POLICY IF EXISTS "notes: delete own or admin" ON public.notes;
CREATE POLICY "notes: delete own or admin" ON public.notes
  FOR DELETE
  USING (
    public.is_admin_or_curator()
    AND (author_id = auth.uid() OR public.is_admin_or_above())
  );

CREATE OR REPLACE FUNCTION public.list_notes(
  p_kind text DEFAULT NULL,
  p_venue_id uuid DEFAULT NULL,
  p_event_id uuid DEFAULT NULL,
  p_all_authors boolean DEFAULT false,
  p_limit integer DEFAULT 200
)
RETURNS TABLE (
  id bigint, author_id uuid, author_display_name text, author_role text,
  kind text, venue_id uuid, venue_name text, event_id uuid, event_title text,
  title text, body text, created_at timestamptz, updated_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin_or_curator() THEN
    RAISE EXCEPTION 'forbidden: curator tier required';
  END IF;
  RETURN QUERY
  SELECT n.id, n.author_id, p.display_name, p.role::text,
         n.kind, n.venue_id, v.name, n.event_id, COALESCE(e.title_bs, e.title_en),
         n.title, n.body, n.created_at, n.updated_at
  FROM public.notes n
  LEFT JOIN public.profiles p ON p.id = n.author_id
  LEFT JOIN public.venues v ON v.id = n.venue_id
  LEFT JOIN public.events e ON e.id = n.event_id
  WHERE (p_kind IS NULL OR n.kind = p_kind)
    AND (p_venue_id IS NULL OR n.venue_id = p_venue_id)
    AND (p_event_id IS NULL OR n.event_id = p_event_id)
    AND (n.author_id = auth.uid() OR (p_all_authors AND public.is_admin_or_above()))
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;
