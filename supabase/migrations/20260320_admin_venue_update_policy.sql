-- Allow authenticated users to update venue descriptions
CREATE POLICY "Authenticated users can update venue descriptions"
ON venues FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
