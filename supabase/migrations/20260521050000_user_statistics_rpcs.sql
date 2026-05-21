-- Per-user statistics for super_admin oversight. Two RPCs:
--   list_user_statistics(p_since): one row per admin-tier user, aggregate counts
--   user_activity_timeline(p_user_id, p_limit): unified recent-actions feed
--
-- Both SECURITY DEFINER + gated on is_admin_or_above(). Session-duration
-- tracking isn't possible without explicit heartbeat infrastructure; we use
-- last_sign_in_at + distinct active days (from our audit_log) as proxies.

CREATE OR REPLACE FUNCTION public.list_user_statistics(
  p_since timestamptz DEFAULT (now() - interval '30 days')
)
RETURNS TABLE (
  user_id uuid, display_name text, email text, role text,
  account_created_at timestamptz, last_sign_in_at timestamptz, last_activity_at timestamptz,
  edits_all_time integer, edits_since integer, edits_today integer,
  notes_all_time integer, notes_since integer,
  flags_raised integer, reverts_performed integer, active_days_since integer
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
DECLARE
  v_today_start timestamptz := date_trunc('day', now() AT TIME ZONE 'Europe/Sarajevo') AT TIME ZONE 'Europe/Sarajevo';
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;
  RETURN QUERY
  SELECT
    p.id, p.display_name, u.email::text, p.role::text,
    u.created_at, u.last_sign_in_at,
    GREATEST(
      COALESCE((SELECT MAX(a.created_at) FROM public.audit_log a WHERE a.actor_id = p.id), '-infinity'::timestamptz),
      COALESCE((SELECT MAX(n.created_at) FROM public.notes n WHERE n.author_id = p.id), '-infinity'::timestamptz)
    ),
    COALESCE((SELECT COUNT(*)::integer FROM public.audit_log a WHERE a.actor_id = p.id), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.audit_log a WHERE a.actor_id = p.id AND a.created_at >= p_since), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.audit_log a WHERE a.actor_id = p.id AND a.created_at >= v_today_start), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.notes n WHERE n.author_id = p.id), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.notes n WHERE n.author_id = p.id AND n.created_at >= p_since), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.audit_log a
      WHERE a.actor_id = p.id AND a.created_at >= p_since AND (a.after ->> 'needs_review')::boolean = true), 0),
    COALESCE((SELECT COUNT(*)::integer FROM public.audit_log a
      WHERE a.reverted_by = p.id AND a.reverted_at >= p_since), 0),
    COALESCE((SELECT COUNT(DISTINCT (a.created_at AT TIME ZONE 'Europe/Sarajevo')::date)::integer
      FROM public.audit_log a WHERE a.actor_id = p.id AND a.created_at >= p_since), 0)
  FROM public.profiles p
  LEFT JOIN auth.users u ON u.id = p.id
  WHERE p.role IN ('editor', 'admin', 'super_admin')
  ORDER BY u.last_sign_in_at DESC NULLS LAST;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_activity_timeline(
  p_user_id uuid,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  kind text, at timestamptz, table_name text, row_id uuid, row_label text, detail text
)
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;
  RETURN QUERY
  WITH events AS (
    SELECT
      CASE WHEN (a.after ->> 'needs_review')::boolean = true THEN 'flag' ELSE 'edit' END,
      a.created_at, a.table_name, a.row_id, a.row_label,
      (SELECT string_agg(k, ', ') FROM jsonb_object_keys(a.after) k WHERE k <> 'updated_at')
    FROM public.audit_log a
    WHERE a.actor_id = p_user_id
    UNION ALL
    SELECT 'revert', a.reverted_at, a.table_name, a.row_id, a.row_label,
      'vraćena izmjena od ' || COALESCE((SELECT p2.display_name FROM public.profiles p2 WHERE p2.id = a.actor_id), 'nepoznat')
    FROM public.audit_log a
    WHERE a.reverted_by = p_user_id AND a.reverted_at IS NOT NULL
    UNION ALL
    SELECT 'note', n.created_at, n.kind, COALESCE(n.venue_id, n.event_id),
      COALESCE(v.name, e.title_bs, e.title_en, '(ideja)'),
      LEFT(n.body, 120)
    FROM public.notes n
    LEFT JOIN public.venues v ON v.id = n.venue_id
    LEFT JOIN public.events e ON e.id = n.event_id
    WHERE n.author_id = p_user_id
  )
  SELECT * FROM events ORDER BY at DESC LIMIT p_limit;
END;
$$;
