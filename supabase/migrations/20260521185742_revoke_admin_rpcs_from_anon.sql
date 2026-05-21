-- P1 step 1 (superseded by 20260521190048_revoke_admin_rpcs_from_public.sql):
-- attempt to revoke EXECUTE on admin RPCs from `anon`. Didn't take effect
-- because the default GRANT TO PUBLIC at function-creation time leaves anon
-- with execute privileges. Kept here for historical accuracy; the follow-up
-- migration revokes from PUBLIC and re-grants to authenticated/service_role.
REVOKE EXECUTE ON FUNCTION public.approve_event_submission(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_venue_claim(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_venue_submission(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_admin_user_list() FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_audit_log(integer, boolean) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_editor_activity(timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_notes(text, uuid, uuid, boolean, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.list_user_statistics(timestamp with time zone) FROM anon;
REVOKE EXECUTE ON FUNCTION public.reject_venue_submission(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.revert_audit_change(bigint) FROM anon;
REVOKE EXECUTE ON FUNCTION public.user_activity_timeline(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.log_admin_changes() FROM anon;
