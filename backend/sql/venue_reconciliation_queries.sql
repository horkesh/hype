-- Operator queries for reconciling the existing venue seed against live venues.
-- Run these against the live/canonical Supabase project on the home machine.

-- 1. Overall live venue count
select count(*) as live_venue_count
from public.venues;

-- 2. Live venue counts by category
select
  category,
  count(*) as venue_count
from public.venues
group by category
order by venue_count desc, category asc;

-- 3. Coverage of key matching fields
select
  count(*) as total_venues,
  count(google_place_id) as with_google_place_id,
  count(instagram_handle) as with_instagram_handle,
  count(latitude) as with_latitude,
  count(longitude) as with_longitude,
  count(description_bs) as with_description_bs,
  count(description_en) as with_description_en
from public.venues;

-- 4. Potential duplicate slugs
select
  slug,
  count(*) as duplicate_count
from public.venues
group by slug
having count(*) > 1
order by duplicate_count desc, slug asc;

-- 5. Potential duplicate google_place_id values
select
  google_place_id,
  count(*) as duplicate_count
from public.venues
where google_place_id is not null
group by google_place_id
having count(*) > 1
order by duplicate_count desc, google_place_id asc;

-- 6. Venue rows missing useful quality fields
select
  id,
  name,
  slug,
  category,
  address,
  google_place_id,
  instagram_handle,
  cover_image_url,
  description_bs,
  latitude,
  longitude
from public.venues
where
  google_place_id is null
  or instagram_handle is null
  or cover_image_url is null
  or description_bs is null
  or latitude is null
  or longitude is null
order by category asc, name asc
limit 100;

-- 7. Venue rows likely ready for event matching confidence
select
  id,
  name,
  slug,
  category,
  address,
  google_place_id,
  latitude,
  longitude
from public.venues
where
  name is not null
  and slug is not null
  and latitude is not null
  and longitude is not null
order by name asc
limit 100;
