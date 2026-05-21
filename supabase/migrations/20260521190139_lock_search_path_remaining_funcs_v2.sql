-- P1 follow-up: pin search_path on the remaining plpgsql functions in public
-- even though they're not SECURITY DEFINER. Same hygiene benefit; clears the
-- function_search_path_mutable advisor warnings.
ALTER FUNCTION public.update_timestamp() SET search_path = public, pg_temp;
ALTER FUNCTION public.touch_notes_updated_at() SET search_path = public, pg_temp;
ALTER FUNCTION public.series_events(uuid) SET search_path = public, pg_temp;
ALTER FUNCTION public.random_cafe(double precision, double precision, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.nearby_venues(double precision, double precision, integer, integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.active_series() SET search_path = public, pg_temp;
ALTER FUNCTION public.upcoming_series(integer) SET search_path = public, pg_temp;
ALTER FUNCTION public.compute_venue_location() SET search_path = public, pg_temp;
ALTER FUNCTION public.tonight_events(integer) SET search_path = public, pg_temp;
