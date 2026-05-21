-- Audit log for curator-tier changes on venues + events.
-- Lets admins review editor changes and revert any individual change.
--
-- The trigger captures only authenticated changes from editor + admin roles.
-- Service-role scripts (cron, manual jobs) have no auth.uid() and are skipped.
-- super_admin actions are also skipped — they're the reviewers, not reviewed.

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  row_id uuid NOT NULL,
  row_label text,
  action text NOT NULL,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role text,
  before jsonb,
  after jsonb,
  reverted_at timestamptz,
  reverted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx ON public.audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_row_idx ON public.audit_log (table_name, row_id, created_at DESC);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "audit_log: admin read" ON public.audit_log;
CREATE POLICY "audit_log: admin read" ON public.audit_log
  FOR SELECT
  USING (public.is_admin_or_above());

CREATE OR REPLACE FUNCTION public.log_admin_changes() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_actor_role text;
  v_changed_keys text[];
  v_before jsonb;
  v_after jsonb;
  v_label text;
BEGIN
  IF v_actor IS NULL THEN RETURN NEW; END IF;
  SELECT role::text INTO v_actor_role FROM public.profiles WHERE id = v_actor;
  IF v_actor_role IS NULL OR v_actor_role IN ('super_admin', 'user') THEN RETURN NEW; END IF;

  SELECT array_agg(key) INTO v_changed_keys
  FROM jsonb_each(to_jsonb(NEW)) AS new_kv(key, value)
  WHERE value IS DISTINCT FROM (to_jsonb(OLD) -> key);

  IF v_changed_keys IS NULL OR array_length(v_changed_keys, 1) = 0 THEN RETURN NEW; END IF;

  SELECT jsonb_object_agg(k, to_jsonb(OLD) -> k),
         jsonb_object_agg(k, to_jsonb(NEW) -> k)
    INTO v_before, v_after
    FROM unnest(v_changed_keys) AS k;

  IF TG_TABLE_NAME = 'venues' THEN
    v_label := NEW.name;
  ELSIF TG_TABLE_NAME = 'events' THEN
    v_label := COALESCE(NEW.title_bs, NEW.title_en);
  END IF;

  INSERT INTO public.audit_log (table_name, row_id, row_label, action, actor_id, actor_role, before, after)
  VALUES (TG_TABLE_NAME, NEW.id, v_label, TG_OP, v_actor, v_actor_role, v_before, v_after);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS venues_audit_update ON public.venues;
CREATE TRIGGER venues_audit_update AFTER UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_changes();

DROP TRIGGER IF EXISTS events_audit_update ON public.events;
CREATE TRIGGER events_audit_update AFTER UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.log_admin_changes();

-- List RPC: returns audit rows joined with actor email + display_name. Gated.
CREATE OR REPLACE FUNCTION public.list_audit_log(
  p_limit integer DEFAULT 200,
  p_editor_only boolean DEFAULT false
)
RETURNS TABLE (
  id bigint, table_name text, row_id uuid, row_label text, action text,
  actor_id uuid, actor_role text, actor_email text, actor_display_name text,
  before jsonb, after jsonb,
  reverted_at timestamptz, reverted_by uuid, created_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;
  RETURN QUERY
  SELECT a.id, a.table_name, a.row_id, a.row_label, a.action,
         a.actor_id, a.actor_role, u.email, p.display_name,
         a.before, a.after, a.reverted_at, a.reverted_by, a.created_at
  FROM public.audit_log a
  LEFT JOIN auth.users u ON u.id = a.actor_id
  LEFT JOIN public.profiles p ON p.id = a.actor_id
  WHERE (NOT p_editor_only OR a.actor_role = 'editor')
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$;

-- Revert RPC: re-applies the `before` snapshot to the target row via dynamic
-- SQL casting per the table's actual column types (handles text[], jsonb,
-- booleans, timestamps). Idempotent: returns 'already_reverted' if called
-- twice, 'row_not_found' if the venue/event row was deleted.
CREATE OR REPLACE FUNCTION public.revert_audit_change(p_audit_id bigint)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_row public.audit_log%ROWTYPE;
  v_count integer;
  v_set_clause text;
BEGIN
  IF NOT public.is_admin_or_above() THEN
    RAISE EXCEPTION 'forbidden: admin tier required';
  END IF;

  SELECT * INTO v_row FROM public.audit_log WHERE id = p_audit_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'audit row % not found', p_audit_id; END IF;
  IF v_row.reverted_at IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'already_reverted', 'reverted_at', v_row.reverted_at);
  END IF;
  IF v_row.table_name NOT IN ('venues', 'events') THEN
    RAISE EXCEPTION 'cannot revert table %', v_row.table_name;
  END IF;
  IF v_row.before IS NULL OR v_row.before = '{}'::jsonb THEN
    RAISE EXCEPTION 'audit row % has empty before snapshot', p_audit_id;
  END IF;

  SELECT string_agg(
    format('%I = (($2 -> %L)::jsonb #>> ''{}'')::%s',
      c.column_name,
      c.column_name,
      CASE
        WHEN c.data_type = 'ARRAY' THEN '_' || replace(c.udt_name, '_', '') || '[]'
        WHEN c.data_type = 'jsonb' THEN 'jsonb'
        ELSE c.udt_name
      END
    ), ', '
  ) INTO v_set_clause
  FROM information_schema.columns c
  WHERE c.table_schema = 'public'
    AND c.table_name = v_row.table_name
    AND v_row.before ? c.column_name;

  IF v_set_clause IS NULL THEN
    RETURN jsonb_build_object('status', 'no_columns');
  END IF;

  EXECUTE format('UPDATE public.%I SET %s WHERE id = $1', v_row.table_name, v_set_clause)
  USING v_row.row_id, v_row.before;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  IF v_count = 0 THEN
    RETURN jsonb_build_object('status', 'row_not_found', 'row_id', v_row.row_id);
  END IF;

  UPDATE public.audit_log SET reverted_at = now(), reverted_by = auth.uid()
  WHERE id = p_audit_id;

  RETURN jsonb_build_object('status', 'reverted', 'rows_affected', v_count);
END;
$$;
