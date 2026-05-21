-- Open the venue-photos Storage bucket to authenticated curator-tier writes
-- (admin app image-replace feature). Cron writes still go via service-role
-- key which bypasses RLS; this only adds curator-tier humans.

DROP POLICY IF EXISTS "Public read venue-photos" ON storage.objects;
CREATE POLICY "Public read venue-photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'venue-photos');

DROP POLICY IF EXISTS "Curator upload venue-photos" ON storage.objects;
CREATE POLICY "Curator upload venue-photos" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'venue-photos' AND public.is_admin_or_curator());

DROP POLICY IF EXISTS "Curator update venue-photos" ON storage.objects;
CREATE POLICY "Curator update venue-photos" ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'venue-photos' AND public.is_admin_or_curator());

DROP POLICY IF EXISTS "Curator delete venue-photos" ON storage.objects;
CREATE POLICY "Curator delete venue-photos" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'venue-photos' AND public.is_admin_or_curator());
