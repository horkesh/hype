-- Visit Sarajevo Instagram posts cache (for Home stories rail)
CREATE TABLE IF NOT EXISTS visit_sarajevo_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  post_url TEXT UNIQUE NOT NULL,
  timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visit_sarajevo_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read posts" ON visit_sarajevo_posts FOR SELECT USING (true);
