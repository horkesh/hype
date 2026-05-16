-- Seeds well-known Sarajevo event venues that show up in ticket-site listings
-- but were missing from the venues table. is_curated=false flags them for the
-- admin curation queue to fill in lat/lng, descriptions, photos via Google
-- Places enrichment. is_active=true so events that link to them render.
--
-- Idempotent: only inserts when the slug doesn't already exist.

INSERT INTO public.venues (name, slug, category, neighborhood, address, is_active, is_curated)
SELECT v.name, v.slug, v.category, v.neighborhood, v.address, true, false
FROM (VALUES
  ('Olimpijska dvorana Juan Antonio Samaranch (Zetra)',
   'olimpijska-dvorana-zetra',
   'concert_hall',
   'Koševo',
   'Alipašina bb, Sarajevo 71000'),
  ('Stadion Grbavica',
   'stadion-grbavica',
   'outdoor',
   'Grbavica',
   'Zvornička 27, Sarajevo 71000'),
  ('AQUA CLUB',
   'aqua-club-sarajevo',
   'club',
   NULL,
   NULL),
  ('Coloseum Club',
   'coloseum-club-sarajevo',
   'club',
   'Centar',
   'Terezije bb, Sarajevo 71000'),
  ('Kino Igman Ilidža',
   'kino-igman-ilidza',
   'cinema',
   'Ilidža',
   'Mala Aleja 50, Ilidža 71210'),
  ('Stadion FK Slavija',
   'stadion-fk-slavija',
   'outdoor',
   'Lukavica',
   'Lukavica, Istočno Sarajevo 71123')
) AS v(name, slug, category, neighborhood, address)
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues e WHERE e.slug = v.slug
);
