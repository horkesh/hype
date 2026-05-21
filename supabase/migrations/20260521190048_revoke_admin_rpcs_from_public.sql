-- Functions get EXECUTE granted to PUBLIC by default at CREATE time, which
-- includes anon. REVOKE FROM anon alone is a no-op while PUBLIC still has it.
-- Revoke from PUBLIC and explicitly re-grant to the roles that need it.

-- Pure admin actions — only authenticated tier should reach them; even then
-- the function body checks is_admin_or_above and raises otherwise.
REVOKE EXECUTE ON FUNCTION public.approve_event_submission(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_event_submission(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.approve_venue_claim(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_venue_claim(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.approve_venue_submission(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_venue_submission(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.reject_venue_submission(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_venue_submission(uuid, text) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.revert_audit_change(bigint) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.revert_audit_change(bigint) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.list_audit_log(integer, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_audit_log(integer, boolean) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.list_editor_activity(timestamp with time zone) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_editor_activity(timestamp with time zone) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.list_notes(text, uuid, uuid, boolean, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_notes(text, uuid, uuid, boolean, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.list_user_statistics(timestamp with time zone) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.list_user_statistics(timestamp with time zone) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.user_activity_timeline(uuid, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.user_activity_timeline(uuid, integer) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.get_admin_user_list() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_admin_user_list() TO authenticated, service_role;

-- Trigger functions are invoked by Postgres internally as the function owner,
-- not the calling role; nothing legit calls them via /rest/v1/rpc/.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_admin_changes() FROM PUBLIC, anon, authenticated;
