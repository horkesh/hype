-- Daily specials reconciliation queries for the home machine.
-- Run these against the live Supabase database before deciding whether the
-- current problem is mostly UI-shape mismatch, sparse data, or both.

-- 1. Topline counts.
select 'daily_specials_total' as metric, count(*)::bigint as value from public.daily_specials
union all
select 'daily_specials_active', count(*)::bigint from public.daily_specials where is_active = true
union all
select 'daily_specials_inactive', count(*)::bigint from public.daily_specials where is_active = false;

-- 2. Distribution by type and active state.
select
  type,
  is_active,
  count(*) as row_count
from public.daily_specials
group by type, is_active
order by row_count desc, type, is_active desc;

-- 3. Venue-linked coverage and completeness.
select
  count(*) as total_specials,
  count(distinct venue_id) as distinct_venues,
  count(*) filter (where title_bs is not null and btrim(title_bs) <> '') as with_title_bs,
  count(*) filter (where title_en is not null and btrim(title_en) <> '') as with_title_en,
  count(*) filter (where description_bs is not null and btrim(description_bs) <> '') as with_description_bs,
  count(*) filter (where description_en is not null and btrim(description_en) <> '') as with_description_en,
  count(*) filter (where price_bam is not null) as with_price_bam,
  count(*) filter (where array_length(valid_days, 1) is not null and array_length(valid_days, 1) > 0) as with_valid_days,
  count(*) filter (where valid_time_start is not null) as with_valid_time_start,
  count(*) filter (where valid_time_end is not null) as with_valid_time_end
from public.daily_specials;

-- 4. Specials by venue category.
select
  v.category as venue_category,
  ds.type,
  count(*) as row_count
from public.daily_specials ds
join public.venues v on v.id = ds.venue_id
group by v.category, ds.type
order by row_count desc, venue_category, ds.type;

-- 5. Active specials by venue count.
select
  v.id as venue_id,
  v.name as venue_name,
  v.category as venue_category,
  count(*) as active_special_count
from public.daily_specials ds
join public.venues v on v.id = ds.venue_id
where ds.is_active = true
group by v.id, v.name, v.category
order by active_special_count desc, venue_name
limit 50;

-- 6. Joined sample for manual product inspection.
select
  ds.id,
  ds.type,
  ds.is_active,
  ds.title_bs,
  ds.title_en,
  ds.price_bam,
  ds.valid_days,
  ds.valid_time_start,
  ds.valid_time_end,
  v.id as venue_id,
  v.name as venue_name,
  v.category as venue_category
from public.daily_specials ds
join public.venues v on v.id = ds.venue_id
order by ds.created_at desc nulls last
limit 50;

-- 7. Sparse-row review sample.
select
  ds.id,
  ds.type,
  ds.is_active,
  ds.title_bs,
  ds.description_bs,
  ds.price_bam,
  ds.valid_days,
  ds.valid_time_start,
  ds.valid_time_end,
  v.name as venue_name
from public.daily_specials ds
join public.venues v on v.id = ds.venue_id
where ds.is_active = true
  and (
    ds.title_bs is null
    or btrim(ds.title_bs) = ''
    or ds.price_bam is null
    or (array_length(ds.valid_days, 1) is null or array_length(ds.valid_days, 1) = 0)
    or ds.valid_time_start is null
    or ds.valid_time_end is null
  )
order by ds.created_at desc nulls last
limit 50;
