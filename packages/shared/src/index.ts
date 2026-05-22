// Public API for @look/shared. Apps import from here, never from internal paths.

export type { Venue, Event, Language } from './types';

export { getBrowserSupabase } from './supabase/browser';
export { createServerSupabase, type NextCookieStore } from './supabase/server';
export { getSupabaseUrl, getSupabaseAnonKey } from './supabase/config';

export {
  getVenueBySlug,
  getVenueById,
  getVenueDescription,
  getVenueInsiderTip,
} from './queries/venues';

export {
  getEventBySlug,
  listUpcomingEvents,
  getEventTitle,
  getEventDescription,
} from './queries/events';

export {
  listActiveVenueSlugs,
  listUpcomingEventSlugs,
} from './queries/sitemap';
