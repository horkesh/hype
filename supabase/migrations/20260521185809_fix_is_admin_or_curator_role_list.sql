-- P1: function name says "curator" but body checked only editor/admin/super_admin.
-- The user_role enum has a 'curator' value that's currently unused; add it to
-- the IN-list so the function matches its name. Backwards-compatible — no
-- profile currently has role='curator', so behaviour is unchanged today.
CREATE OR REPLACE FUNCTION public.is_admin_or_curator()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public, pg_temp
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('curator', 'editor', 'admin', 'super_admin')
      AND is_banned = FALSE
  );
END;
$function$;
