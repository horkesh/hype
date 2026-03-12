-- Operator queries for inspecting the first Hype ingestion runs.
-- Run these against the live/canonical Supabase project after seeding sources
-- and executing manual ingestion runs.

-- 1. Current seeded sources
select
  id,
  name,
  source_url,
  tier,
  frequency_hours,
  is_active,
  last_scraped_at
from public.scrape_sources
order by tier asc, name asc;

-- 2. Recent scrape runs
select
  id,
  source_id,
  created_at,
  events_created,
  error,
  parsed_data ->> 'stage' as stage,
  parsed_data ->> 'mode' as mode,
  parsed_data ->> 'dryRun' as dry_run,
  parsed_data ->> 'fetchedUrl' as fetched_url
from public.scrape_log
order by created_at desc
limit 25;

-- 3. Recent raw rows for the first active sources
select
  created_at,
  source_name,
  source_url,
  title_raw,
  date_raw,
  venue_name_raw,
  image_url,
  parsed,
  venue_match_status
from public.raw_events
where source_name in (
  'Pozorista.ba (all theatres)',
  'AllEvents.in Sarajevo',
  'KupiKartu.ba'
)
order by created_at desc
limit 50;

-- 4. Raw rows still missing basic metadata
select
  source_name,
  source_url,
  title_raw,
  date_raw,
  venue_name_raw,
  image_url
from public.raw_events
where source_name in (
  'Pozorista.ba (all theatres)',
  'AllEvents.in Sarajevo',
  'KupiKartu.ba'
)
  and (
    date_raw is null
    or venue_name_raw is null
    or image_url is null
  )
order by created_at desc
limit 50;

-- 5. Unmatched raw rows that likely need the next parse/match pass
select
  created_at,
  source_name,
  title_raw,
  date_raw,
  venue_name_raw,
  venue_match_status
from public.raw_events
where venue_match_status = 'unmatched'
order by created_at desc
limit 50;

-- 6. Parse-preview-ready rows
select
  id,
  source_name,
  source_url,
  title_raw,
  date_raw,
  venue_name_raw,
  image_url,
  parse_attempts,
  parsed,
  venue_match_status
from public.raw_events
where parsed = false
order by created_at desc
limit 50;
