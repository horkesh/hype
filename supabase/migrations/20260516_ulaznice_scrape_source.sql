-- Adds Ulaznice.org as a tier-1 ticketing source.
-- BiH-wide marketplace, so the parser drops cards whose smallinfo span resolves
-- to a non-Sarajevo city. Music + theater categories only.

INSERT INTO public.scrape_sources (
  name,
  source_url,
  tier,
  scrape_config,
  frequency_hours,
  is_active
)
SELECT
  'Ulaznice.org Sarajevo',
  'https://www.ulaznice.org/cat/1/muzika',
  1,
  '{
    "fetch_method": "direct_html",
    "list_url": "https://www.ulaznice.org/cat/1/muzika",
    "category_urls": [
      "https://www.ulaznice.org/cat/3/pozoriste"
    ],
    "parser_hint": "ulaznice_listing",
    "event_url_pattern": "/{vendor}/tickets/{id}/{slug}",
    "city_filter": "Sarajevo",
    "seed_origin": "manual_addition_2026_05_16",
    "seed_confidence": "high"
  }'::jsonb,
  6,
  true
WHERE NOT EXISTS (
  SELECT 1 FROM public.scrape_sources
  WHERE source_url = 'https://www.ulaznice.org/cat/1/muzika'
);
