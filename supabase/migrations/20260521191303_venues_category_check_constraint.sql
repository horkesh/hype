-- P5: venues.category was plain text with no DB-level constraint, so a typo
-- in an admin edit or a script could land 'restraunt' / 'cafee' / etc. and
-- silently break category filters. Add a CHECK against the canonical list
-- (matches the 14 values currently in use; extend the list when the product
-- adds a new category).
ALTER TABLE public.venues
  ADD CONSTRAINT venues_category_allowed
  CHECK (category IN (
    'restaurant', 'cafe', 'bar', 'bakery', 'wellness', 'gallery', 'outdoor',
    'club', 'cultural_center', 'theatre', 'cinema', 'spa', 'concert_hall',
    'museum', 'landmark', 'shop', 'market', 'hotel', 'park', 'sport'
  ));
