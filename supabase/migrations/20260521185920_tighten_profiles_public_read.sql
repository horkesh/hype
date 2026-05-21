-- P1: the old "Profiles: public read" policy had qual=true for {public},
-- exposing role / is_banned / total_checkins / etc. to unauthenticated users.
-- Mobile app doesn't query profiles directly. Admin and authenticated-user
-- features keep full row reads (RLS on UPDATE still applies separately).
-- If anon-readable display names are needed later, add a thin view exposing
-- just id/display_name/avatar_url.
DROP POLICY IF EXISTS "Profiles: public read" ON public.profiles;

CREATE POLICY "Profiles: authenticated read"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);
