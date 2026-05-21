-- P1: hero-images and venue-photos buckets are public (public=true on the
-- bucket), so URL-based file fetches work without any storage.objects RLS
-- policy. The "Public read" SELECT policies enable the LIST API, which lets
-- anyone enumerate every file in those buckets. Drop them.
-- The event-covers bucket already follows this pattern (no LIST policy).
DROP POLICY IF EXISTS "Public read hero-images" ON storage.objects;
DROP POLICY IF EXISTS "Public read venue-photos" ON storage.objects;
