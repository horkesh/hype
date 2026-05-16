-- Adds two more well-known Sarajevo event venues caught by the second
-- ulaznice + allevents promotion run as venue_id=null entries:
--   - Stadion Asim Ferhatović "Hase" (Koševo) — Dino Merlin, large concerts
--   - Metalac — 7. LIVE STAGE FESTIVAL, smaller venue in Vogošća
-- Idempotent by slug.

INSERT INTO public.venues (name, slug, category, neighborhood, address, is_active, is_curated)
SELECT v.name, v.slug, v.category, v.neighborhood, v.address, true, false
FROM (VALUES
  ('Stadion Asim Ferhatović Hase (Koševo)',
   'stadion-asim-ferhatovic-hase',
   'outdoor',
   'Koševo',
   'Patriotske lige 35, Sarajevo 71000'),
  ('Metalac',
   'metalac-sarajevo',
   'club',
   'Vogošća',
   NULL)
) AS v(name, slug, category, neighborhood, address)
WHERE NOT EXISTS (
  SELECT 1 FROM public.venues e WHERE e.slug = v.slug
);
