-- P0: the "Authenticated users can update venue descriptions" policy had
-- qual=true / with_check=true for the authenticated role. Combined with the
-- OR-semantics of permissive RLS policies it gave any signed-in user full
-- UPDATE rights on every venue row (name, slug, is_active, claimed_by, etc.).
-- The owner-update and admin-full-access policies are sufficient for legit
-- writes; description-only edits should go through a SECURITY DEFINER RPC.
DROP POLICY IF EXISTS "Authenticated users can update venue descriptions" ON public.venues;
