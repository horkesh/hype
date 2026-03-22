-- Heritage Walks: interactive walking tours powered by Visit Sarajevo content
CREATE TABLE IF NOT EXISTS heritage_walks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title_bs TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_bs TEXT,
  description_en TEXT,
  icon TEXT DEFAULT 'walk',
  cover_image_url TEXT,
  estimated_minutes INTEGER DEFAULT 90,
  distance_km NUMERIC(4,1) DEFAULT 2.0,
  difficulty TEXT DEFAULT 'easy',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS heritage_walk_stops (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  walk_id UUID REFERENCES heritage_walks(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES venues(id),
  sort_order INTEGER NOT NULL,
  title_bs TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_bs TEXT,
  description_en TEXT,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  walking_minutes_to_next INTEGER DEFAULT 5,
  what_to_look_for_bs TEXT,
  what_to_look_for_en TEXT,
  source_attribution TEXT DEFAULT 'Visit Sarajevo'
);

ALTER TABLE heritage_walks ENABLE ROW LEVEL SECURITY;
ALTER TABLE heritage_walk_stops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read walks" ON heritage_walks FOR SELECT USING (true);
CREATE POLICY "Public read stops" ON heritage_walk_stops FOR SELECT USING (true);
