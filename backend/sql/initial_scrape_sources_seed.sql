-- Initial scrape_sources seed for the first Hype ingestion slice.
-- Use this only against the live/canonical Supabase project after confirming
-- the source inventory in docs/03-architecture/initial_source_inventory.md.

insert into public.scrape_sources (
  name,
  source_url,
  tier,
  scrape_config,
  frequency_hours,
  is_active
)
values
  (
    'Pozorista.ba (all theatres)',
    'https://pozorista.ba/?post_type=event',
    1,
    '{
      "fetch_method": "direct_html",
      "list_url": "https://pozorista.ba/?post_type=event",
      "parser_hint": "pozorista_calendar",
      "seed_origin": "legacy_docs",
      "seed_confidence": "high",
      "discovered_via": "validated_architecture_docs"
    }'::jsonb,
    12,
    true
  ),
  (
    'AllEvents.in Sarajevo',
    'https://allevents.in/sarajevo/all',
    1,
    '{
      "fetch_method": "direct_html",
      "list_url": "https://allevents.in/sarajevo/all",
      "list_urls": [
        "https://allevents.in/sarajevo/music",
        "https://allevents.in/sarajevo/parties",
        "https://allevents.in/sarajevo/theatre"
      ],
      "parser_hint": "allevents_listing",
      "proxy_for": "facebook_events",
      "seed_origin": "legacy_docs",
      "seed_confidence": "high",
      "discovered_via": "validated_architecture_docs"
    }'::jsonb,
    6,
    true
  ),
  (
    'KupiKartu.ba',
    'https://www.kupikartu.ba',
    1,
    '{
      "fetch_method": "direct_html",
      "list_url": "https://www.kupikartu.ba",
      "category_urls": [
        "/karte/kategorija/2",
        "/karte/kategorija/1",
        "/karte/kategorija/3",
        "/karte/kategorija/4",
        "/karte/kategorija/25"
      ],
      "parser_hint": "kupikartu_listing",
      "event_url_pattern": "/karte/event/{id}/{slug}",
      "seed_origin": "legacy_docs",
      "seed_confidence": "high",
      "discovered_via": "validated_architecture_docs"
    }'::jsonb,
    6,
    true
  ),
  (
    'Entrio.ba',
    'https://www.entrio.ba/en/events',
    1,
    '{
      "fetch_method": "headless_browser",
      "browser_vendor": "apify",
      "parser_hint": "ticketing_listing",
      "city_filter": "Sarajevo",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until a non-403 fetch path exists."
    }'::jsonb,
    6,
    false
  ),
  (
    'FiestaLama',
    'https://fiestalama.com/en',
    2,
    '{
      "fetch_method": "headless_browser",
      "browser_vendor": "apify",
      "parser_hint": "ticketing_listing",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until Apify or API/partnership path exists."
    }'::jsonb,
    12,
    false
  ),
  (
    'CineStar Sarajevo',
    'https://cinestarcinemas.ba/sarajevo-bingo-city-center',
    2,
    '{
      "fetch_method": "direct_html",
      "list_url": "https://cinestarcinemas.ba/sarajevo-bingo-city-center",
      "parser_hint": "cinema_program",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until the cinema selector rewrite is done."
    }'::jsonb,
    12,
    false
  ),
  (
    'CineStar BiH IG',
    'https://instagram.com/cinestarcinemas_bih',
    1,
    '{
      "fetch_method": "apify",
      "instagram_username": "cinestarcinemas_bih",
      "max_posts": 10,
      "parser_hint": "instagram_event_post",
      "content_focus": "events_and_specials",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until Instagram ingestion is wired."
    }'::jsonb,
    24,
    false
  ),
  (
    'Kino Meeting Point IG',
    'https://instagram.com/meetingpoint_sa',
    1,
    '{
      "fetch_method": "apify",
      "instagram_username": "meetingpoint_sa",
      "max_posts": 10,
      "parser_hint": "instagram_event_post",
      "content_focus": "events_and_specials",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until Instagram ingestion is wired."
    }'::jsonb,
    24,
    false
  ),
  (
    'KupiKartu IG',
    'https://instagram.com/kupikartu.ba',
    1,
    '{
      "fetch_method": "apify",
      "instagram_username": "kupikartu.ba",
      "max_posts": 10,
      "parser_hint": "instagram_event_post",
      "content_focus": "events_and_specials",
      "seed_origin": "legacy_docs",
      "seed_confidence": "medium",
      "discovered_via": "validated_architecture_docs",
      "activation_note": "Keep inactive until Instagram ingestion is wired."
    }'::jsonb,
    24,
    false
  );
