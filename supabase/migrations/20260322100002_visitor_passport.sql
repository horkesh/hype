-- Visitor Passport: gamification with Visit Sarajevo top attractions
CREATE TABLE IF NOT EXISTS passport_stamps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  venue_id UUID REFERENCES venues(id),
  walk_id UUID REFERENCES heritage_walks(id),
  stamp_type TEXT NOT NULL CHECK (stamp_type IN ('attraction', 'walk_complete', 'explorer')),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, venue_id, stamp_type)
);

CREATE TABLE IF NOT EXISTS passport_attractions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES venues(id),
  name_bs TEXT NOT NULL,
  name_en TEXT NOT NULL,
  stamp_icon TEXT DEFAULT 'star',
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE passport_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE passport_attractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own stamps" ON passport_stamps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own stamps" ON passport_stamps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public read attractions" ON passport_attractions FOR SELECT USING (true);
