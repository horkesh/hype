-- Extend user_role enum with editor and super_admin tiers
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Curation tracking columns on venues
ALTER TABLE venues ADD COLUMN IF NOT EXISTS is_curated boolean NOT NULL DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS curator_notes text;
