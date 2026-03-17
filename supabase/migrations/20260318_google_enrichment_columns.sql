-- Google Places enrichment columns
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_rating numeric;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_ratings_count integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_price_level integer;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_editorial_summary text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_top_reviews text[];
ALTER TABLE venues ADD COLUMN IF NOT EXISTS website text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS opening_hours_json jsonb;
