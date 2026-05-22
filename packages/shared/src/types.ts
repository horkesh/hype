// Shared types for venues + events. These intentionally mirror the Supabase
// row shape (snake_case columns) — converting to camelCase is the consumer's
// job if needed. Keeping the shape literal makes RSC ↔ client serialization
// trivial (no Date instances, no Maps).

export interface Venue {
  id: string;
  slug: string;
  name: string;
  category: string;
  neighborhood: string | null;
  address: string | null;
  cover_image_url: string | null;
  description_bs: string | null;
  description_en: string | null;
  insider_tip_bs: string | null;
  insider_tip_en: string | null;
  moods: string[] | null;
  google_rating: number | null;
  google_ratings_count: number | null;
  price_level: number | null;
  phone: string | null;
  website: string | null;
  instagram_handle: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  is_featured: boolean;
  is_hidden_gem: boolean;
}

export interface Event {
  id: string;
  title_bs: string | null;
  title_en: string | null;
  description_bs: string | null;
  description_en: string | null;
  category: string;
  start_datetime: string;
  cover_image_url: string | null;
  ticket_url: string | null;
  venue_id: string | null;
  location_name: string | null;
  is_active: boolean;
  status: string;
}

export type Language = 'bs' | 'en';
