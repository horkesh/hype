-- Belt-and-suspenders: prevent future code from re-introducing Google Place
-- Photo URLs in venues.cover_image_url. Google's photo_reference tokens are
-- time-limited (hours to days), so a stored URL like
--   https://maps.googleapis.com/maps/api/place/photo?photo_reference=X&key=Y
-- works briefly then starts returning 400 Bad Request. All covers must live on
-- Supabase Storage (the `venue-photos` bucket).
--
-- scrapeGooglePhotos.ts handles this correctly: it downloads the image bytes
-- and uploads to Storage. This constraint catches any regression.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'venues_cover_url_not_google'
  ) THEN
    ALTER TABLE public.venues
    ADD CONSTRAINT venues_cover_url_not_google
    CHECK (cover_image_url IS NULL OR cover_image_url NOT LIKE 'https://maps.googleapis.com/%');
  END IF;
END $$;
