-- Events and event-series reconciliation queries for the home machine.
-- Run these against the live Supabase database before designing canonical
-- promotion, duplicate handling, or series-creation behavior.

-- 1. Topline counts.
select 'events_total' as metric, count(*)::bigint as value from public.events
union all
select 'events_active', count(*)::bigint from public.events where is_active = true
union all
select 'events_approved', count(*)::bigint from public.events where status = 'approved'
union all
select 'events_active_approved', count(*)::bigint
from public.events
where is_active = true and status = 'approved'
union all
select 'events_upcoming_active_approved', count(*)::bigint
from public.events
where is_active = true
  and status = 'approved'
  and start_datetime >= now()
union all
select 'event_series_total', count(*)::bigint from public.event_series
union all
select 'event_series_active', count(*)::bigint from public.event_series where is_active = true;

-- 2. Event distribution by category and approval state.
select
  category,
  status,
  count(*) as row_count
from public.events
group by category, status
order by row_count desc, category, status;

-- 3. Event linkage coverage.
select
  count(*) as total_events,
  count(*) filter (where venue_id is not null) as with_venue_id,
  count(*) filter (where series_id is not null) as with_series_id,
  count(*) filter (where ticket_url is not null and btrim(ticket_url) <> '') as with_ticket_url,
  count(*) filter (where source is not null and btrim(source) <> '') as with_source,
  count(*) filter (where cover_image_url is not null and btrim(cover_image_url) <> '') as with_cover_image,
  count(*) filter (where title_en is not null and btrim(title_en) <> '') as with_title_en,
  count(*) filter (where description_en is not null and btrim(description_en) <> '') as with_description_en
from public.events;

-- 4. Fallback-location coverage for non-venue-linked events.
select
  count(*) as non_venue_events,
  count(*) filter (where location_name is not null and btrim(location_name) <> '') as with_location_name,
  count(*) filter (where location_address is not null and btrim(location_address) <> '') as with_location_address,
  count(*) filter (where latitude is not null and longitude is not null) as with_coordinates
from public.events
where venue_id is null;

-- 5. Upcoming approved events by venue linkage.
select
  case when venue_id is null then 'location_only' else 'venue_linked' end as linkage_type,
  count(*) as row_count
from public.events
where is_active = true
  and status = 'approved'
  and start_datetime >= now()
group by linkage_type
order by row_count desc;

-- 6. Series completeness.
select
  count(*) as total_series,
  count(*) filter (where slug is not null and btrim(slug) <> '') as with_slug,
  count(*) filter (where cover_image_url is not null and btrim(cover_image_url) <> '') as with_cover_image,
  count(*) filter (where logo_url is not null and btrim(logo_url) <> '') as with_logo,
  count(*) filter (where website_url is not null and btrim(website_url) <> '') as with_website,
  count(*) filter (where ticket_url is not null and btrim(ticket_url) <> '') as with_ticket_url,
  count(*) filter (where name_en is not null and btrim(name_en) <> '') as with_name_en,
  count(*) filter (where description_en is not null and btrim(description_en) <> '') as with_description_en
from public.event_series;

-- 7. Event counts per active series.
select
  s.id,
  s.slug,
  s.name_bs,
  s.name_en,
  count(e.id) as linked_events
from public.event_series s
left join public.events e on e.series_id = s.id
group by s.id, s.slug, s.name_bs, s.name_en
order by linked_events desc, s.name_bs;

-- 8. Sample of upcoming approved events for manual inspection.
select
  e.id,
  e.title_bs,
  e.title_en,
  e.category,
  e.type,
  e.start_datetime,
  e.venue_id,
  v.name as venue_name,
  e.series_id,
  s.name_bs as series_name_bs,
  e.price_bam,
  e.ticket_url,
  e.source,
  e.cover_image_url
from public.events e
left join public.venues v on v.id = e.venue_id
left join public.event_series s on s.id = e.series_id
where e.is_active = true
  and e.status = 'approved'
  and e.start_datetime >= now()
order by e.start_datetime asc
limit 50;

-- 9. Potential duplicate-review sample by same day + similar title + same venue.
select
  date_trunc('day', e1.start_datetime) as event_day,
  v.name as venue_name,
  e1.title_bs as title_a,
  e2.title_bs as title_b,
  e1.id as event_a_id,
  e2.id as event_b_id
from public.events e1
join public.events e2
  on e1.id < e2.id
 and e1.venue_id is not null
 and e1.venue_id = e2.venue_id
 and date_trunc('day', e1.start_datetime) = date_trunc('day', e2.start_datetime)
join public.venues v on v.id = e1.venue_id
where e1.is_active = true
  and e2.is_active = true
  and e1.status = 'approved'
  and e2.status = 'approved'
  and lower(e1.title_bs) <> lower(e2.title_bs)
order by event_day desc, venue_name
limit 50;
