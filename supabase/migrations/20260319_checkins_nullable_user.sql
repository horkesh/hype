-- Allow anonymous check-ins for demo seeding
ALTER TABLE checkins ALTER COLUMN user_id DROP NOT NULL;
