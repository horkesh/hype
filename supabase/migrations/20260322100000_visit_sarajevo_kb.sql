-- Visit Sarajevo knowledge base (for Ask Sarajevo AI concierge)
CREATE TABLE IF NOT EXISTS visit_sarajevo_kb (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_url TEXT UNIQUE NOT NULL,
  page_title TEXT,
  content_text TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE visit_sarajevo_kb ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read kb" ON visit_sarajevo_kb FOR SELECT USING (true);
