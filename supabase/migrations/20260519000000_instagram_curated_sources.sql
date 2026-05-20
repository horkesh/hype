-- Instagram event-scrape curation
--
-- 1. NULL polluted instagram_handle values from Apify search-scraper discovery noise
-- 2. UPDATE known event hotspots with verified handles found via WebSearch
-- 3. Replace the 62 unstructured IG scrape_sources rows with a curated tier 1/2/3 list
--
-- Tier 1 (weekly, 168h): proven event hosts + high-confidence venues + festivals + tourism (44)
-- Tier 2 (bi-weekly, 336h): pubs/bars with secondary live-music signal (25)
-- Tier 3 (monthly,  720h): galleries and museums (22)

BEGIN;

-- =========================================================================
-- Part 1: NULL polluted handles
-- =========================================================================
-- 'lounge_' matched 14 unrelated hookah venues (generic discovery hit)
-- single-word generics ('muzej','sarajevo','planet') matched a wrong account
-- 'soba.____' carries trailing-noise pollution
-- 'uprava' row duplicates 'Despić House' for the same museum admin handle
UPDATE venues
SET instagram_handle = NULL,
    curator_notes = COALESCE(curator_notes || E'\n', '')
      || 'IG handle scrubbed 2026-05-19: discovery noise (was: '
      || instagram_handle || ')'
WHERE instagram_handle IN ('lounge_','muzej','sarajevo','planet','soba.____')
   OR (instagram_handle = 'muzejsarajeva' AND name ILIKE '%uprava%');

-- =========================================================================
-- Part 2: Add missing handles for known event hotspots
-- =========================================================================
UPDATE venues SET instagram_handle = 'coloseumclubcasinos'
WHERE id = '8adc1d32-1968-4d84-9625-d6e594a5a854'  -- Coloseum Club
  AND (instagram_handle IS NULL OR instagram_handle = '');

UPDATE venues SET instagram_handle = 'zetraolimpijskarena'
WHERE id = '0b1829ed-f61b-4bae-aa01-6e90b74059db'  -- Olimpijska dvorana JAS (Zetra)
  AND (instagram_handle IS NULL OR instagram_handle = '');

-- =========================================================================
-- Part 3: Replace IG scrape_sources with curated tier 1/2/3 list
-- =========================================================================
DELETE FROM scrape_sources WHERE scrape_config->>'fetch_method' = 'apify_instagram';

-- Tier 1: proven hosts + high-confidence venues + festivals + tourism
-- Weekly cadence (168h)
INSERT INTO scrape_sources (name, source_url, tier, scrape_config, frequency_hours, is_active)
SELECT
  'Instagram: @' || username,
  'https://www.instagram.com/' || username || '/',
  1,
  jsonb_build_object(
    'fetch_method', 'apify_instagram',
    'username', username,
    'max_posts', 10,
    'parser_hint', 'instagram_caption',
    'curation_reason', reason
  ),
  168,
  true
FROM (VALUES
  -- Proven event hosts (already produced canonical events)
  ('cinemas.sloga','proven'),
  ('nps_sarajevo','proven'),
  ('bkc_sarajevo','proven'),
  ('dommladih','proven'),
  ('ag_club_sa','proven'),
  ('aqua.club.sarajevo','proven'),
  ('sarajevo1425days','proven'),
  ('kamerniteatar55','proven'),
  ('vijecnicasarajevo','proven'),
  ('festivalsvjetlasarajevo','proven'),
  -- Live-music bars
  ('jazzbina.sa','live_music'),
  ('pinkhoudini','live_music'),
  ('hemingways387','live_music'),
  ('club.monument','live_music'),
  ('aquarius.vils','live_music'),
  ('mala.basta.sa','live_music'),
  ('pivnicahs','live_music'),
  ('pivnicasarajevo','live_music'),
  ('shelterpubsarajevo','live_music'),
  ('freakys.pub','live_music'),
  ('the.pub.station.sarajevo','live_music'),
  ('citypubsarajevo','live_music'),
  -- Nightclubs / electronic / parties
  ('underground_sa','nightclub'),
  ('kinobosna.sa','nightclub'),
  ('hacienda_sa','nightclub'),
  ('dasistwalterclub','nightclub'),
  ('mash.sarajevo','nightclub'),
  ('bambusclubsarajevo','nightclub'),
  ('fiskultura_sarajevo','nightclub'),
  ('cltropics','nightclub'),
  -- Theatre / cinema / culture
  ('sartr_teatar','theatre'),
  ('meetingpointcinema','cinema'),
  ('sevdaharthouse','culture'),
  ('pozoristemladihsarajevo','theatre'),
  ('dasistwalterpub','gastropub_events'),
  -- Hotspots discovered in this pass (Coloseum, Zetra, big galleries)
  ('coloseumclubcasinos','hotspot_added'),
  ('zetraolimpijskarena','hotspot_added'),
  ('galerija110795','culture'),
  -- Festivals + tourism board
  ('jazzfestsarajevo','festival'),
  ('festivalmess','festival'),
  ('sarajevofilmfestival','festival'),
  ('sarajevskizimskifestival','festival'),
  ('warchildhood','museum'),
  ('sarajevo_tourism','tourism_board')
) AS t(username, reason);

-- Tier 2: pubs/bars with secondary live-music or open-mic signal
-- Bi-weekly cadence (336h)
INSERT INTO scrape_sources (name, source_url, tier, scrape_config, frequency_hours, is_active)
SELECT
  'Instagram: @' || username,
  'https://www.instagram.com/' || username || '/',
  2,
  jsonb_build_object(
    'fetch_method', 'apify_instagram',
    'username', username,
    'max_posts', 10,
    'parser_hint', 'instagram_caption',
    'curation_reason', 'pub_signal'
  ),
  336,
  true
FROM (VALUES
  ('celticpubsarajevo'),
  ('asterix_pub'),
  ('britishpubilidza'),
  ('balkan_express_is'),
  ('sarajevo_taverna'),
  ('pub84sarajevo'),
  ('taylors_pub'),
  ('vikingpub.sa'),
  ('pirates.pub.sarajevo'),
  ('walter_ego_pub'),
  ('public.house.sarajevo'),
  ('londonerpub_sarajevo'),
  ('gastro_pub_fabrika'),
  ('vucko.pub'),
  ('fis_moviepub'),
  ('pubdante'),
  ('dilemapub'),
  ('_titova._'),
  ('caffe_club_le_figaro'),
  ('decobarsarajevo'),
  ('jazz.radio.sarajevo'),
  ('central_pub_sarajevo'),
  ('club_mash_sarajevo'),
  ('ortcaffebar'),
  ('pub_arka')
) AS t(username);

-- Tier 3: galleries and museums (rare events, opening receptions)
-- Monthly cadence (720h), only 8 posts/run to save budget
INSERT INTO scrape_sources (name, source_url, tier, scrape_config, frequency_hours, is_active)
SELECT
  'Instagram: @' || username,
  'https://www.instagram.com/' || username || '/',
  3,
  jsonb_build_object(
    'fetch_method', 'apify_instagram',
    'username', username,
    'max_posts', 8,
    'parser_hint', 'instagram_caption',
    'curation_reason', 'gallery'
  ),
  720,
  true
FROM (VALUES
  ('amigalerija'),
  ('arsaevi'),
  ('artcraftsarajevo'),
  ('collegiumartisticum'),
  ('denita_gioielli'),
  ('exyurockcentar'),
  ('galerija_kicos'),
  ('galerija_novembar'),
  ('galerija.cd.art.sarajevo'),
  ('galerija.manifesto'),
  ('galerijajava'),
  ('goyakart'),
  ('historijskimuzej'),
  ('isfahangallery'),
  ('olympicmuseumsarajevo'),
  ('raskoshconcept'),
  ('sarajevo80s_museum'),
  ('savrxmuseum'),
  ('tunelspasa'),
  ('ulupubih'),
  ('zemaljskimuzej_bih'),
  ('zt.art_umjetnickeslike')
) AS t(username);

COMMIT;
