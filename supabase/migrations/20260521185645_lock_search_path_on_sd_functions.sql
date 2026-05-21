-- P1: every SECURITY DEFINER function bypasses RLS, so a user with CREATE
-- on a schema earlier in the resolver's search_path can shadow tables like
-- profiles/events/venues and escalate during any SD call. Pin search_path
-- to public + pg_temp so identifier resolution can't be hijacked.
ALTER FUNCTION public.approve_event_submission(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.approve_venue_claim(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.approve_venue_submission(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.get_admin_user_list() SET search_path = public, pg_temp;
ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin_or_above() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_admin_or_curator() SET search_path = public, pg_temp;
ALTER FUNCTION public.is_venue_owner(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.list_audit_log(integer, boolean) SET search_path = public, pg_temp;
ALTER FUNCTION public.list_editor_activity(timestamp with time zone) SET search_path = public, pg_temp;
ALTER FUNCTION public.list_notes(text, uuid, uuid, boolean, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.list_user_statistics(timestamp with time zone) SET search_path = public, pg_temp;
ALTER FUNCTION public.log_admin_changes() SET search_path = public, pg_temp;
ALTER FUNCTION public.reject_venue_submission(uuid, text) SET search_path = public, pg_temp;
ALTER FUNCTION public.revert_audit_change(bigint) SET search_path = public, pg_temp;
ALTER FUNCTION public.user_activity_timeline(uuid, integer) SET search_path = public, pg_temp;
