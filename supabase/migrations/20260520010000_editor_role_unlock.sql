-- Editor role unlock
--
-- The 2026-04-10 admin_roles_curation migration added 'editor' and 'super_admin'
-- to the user_role enum, but never updated is_admin_or_curator() to actually
-- include editors. End result: the editor role was powerless on every
-- RLS-gated table (19 tables / 24 policies). Fixed here.
--
-- Also splits out a stricter is_admin_or_above() for profile mutations so
-- editors can curate content but can't promote themselves or ban users.

CREATE OR REPLACE FUNCTION public.is_admin_or_curator() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('editor', 'admin', 'super_admin')
      AND is_banned = FALSE
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above() RETURNS boolean
LANGUAGE plpgsql STABLE SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
      AND is_banned = FALSE
  );
END;
$$;

DROP POLICY IF EXISTS "Profiles: admin update" ON profiles;
CREATE POLICY "Profiles: admin update" ON profiles
  FOR UPDATE
  USING (is_admin_or_above());
