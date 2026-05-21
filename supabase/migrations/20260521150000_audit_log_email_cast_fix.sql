-- Fix "structure of query does not match function result type" on
-- public.list_audit_log. auth.users.email is character varying(255), but
-- the function declared the corresponding TABLE column as text. Postgres
-- considers varchar and text structurally different for RETURNS TABLE, so
-- the function errored at every call. Casting u.email to text makes the
-- projection type match the declaration.

CREATE OR REPLACE FUNCTION public.list_audit_log(
  p_limit integer DEFAULT 200,
  p_editor_only boolean DEFAULT false
)
RETURNS TABLE(
  id bigint,
  table_name text,
  row_id uuid,
  row_label text,
  action text,
  actor_id uuid,
  actor_role text,
  actor_email text,
  actor_display_name text,
  before jsonb,
  after jsonb,
  reverted_at timestamptz,
  reverted_by uuid,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;

  RETURN QUERY
  SELECT
    a.id,
    a.table_name,
    a.row_id,
    a.row_label,
    a.action,
    a.actor_id,
    a.actor_role,
    u.email::text,
    p.display_name,
    a.before,
    a.after,
    a.reverted_at,
    a.reverted_by,
    a.created_at
  FROM public.audit_log a
  LEFT JOIN auth.users u ON u.id = a.actor_id
  LEFT JOIN public.profiles p ON p.id = a.actor_id
  WHERE (NOT p_editor_only OR a.actor_role = 'editor')
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$function$;
