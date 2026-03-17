-- City pulse cache table
CREATE TABLE IF NOT EXISTS city_pulse (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pulse_bs text NOT NULL,
  pulse_en text NOT NULL,
  time_of_day text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI plans table
CREATE TABLE IF NOT EXISTS ai_plans (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  moods text[] DEFAULT '{}',
  group_size int DEFAULT 2,
  budget text DEFAULT 'mid',
  plan_json jsonb NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now()
);

-- Checkins table
CREATE TABLE IF NOT EXISTS checkins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  venue_id uuid REFERENCES venues(id),
  created_at timestamptz DEFAULT now()
);

-- Ensure venues have description columns
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description_bs text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS description_en text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_hidden_gem boolean DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS insider_tip_bs text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS insider_tip_en text;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS google_place_id text;
