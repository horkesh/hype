-- Admin+ view of editor activity since p_since. Used by the Pregled
-- "Aktivnost urednika" card. Client passes its local start-of-day so the
-- "danas" semantics match the user's timezone, not UTC midnight.
CREATE OR REPLACE FUNCTION public.list_editor_activity(
  p_since timestamptz DEFAULT (now() - interval '24 hours')
)
RETURNS TABLE (
  editor_id uuid,
  display_name text,
  email text,
  role text,
  edits integer,
  notes integer,
  reviews_flagged integer,
  last_active timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;

  RETURN QUERY
  SELECT
    p.id AS editor_id,
    p.display_name,
    u.email::text,
    p.role::text,
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.audit_log a
      WHERE a.actor_id = p.id AND a.created_at >= p_since
    ), 0) AS edits,
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.notes n
      WHERE n.author_id = p.id AND n.created_at >= p_since
    ), 0) AS notes,
    COALESCE((
      SELECT COUNT(*)::integer
      FROM public.audit_log a
      WHERE a.actor_id = p.id
        AND a.created_at >= p_since
        AND (a.after ->> 'needs_review')::boolean = true
    ), 0) AS reviews_flagged,
    (
      SELECT MAX(a.created_at)
      FROM public.audit_log a
      WHERE a.actor_id = p.id
    ) AS last_active
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.role IN ('editor', 'admin')
  ORDER BY edits DESC, notes DESC, p.display_name;
END;
$$;
