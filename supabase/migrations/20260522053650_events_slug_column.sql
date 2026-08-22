-- RECOVERED 2026-08-22 from supabase_migrations.schema_migrations on the live
-- project (kyfoqltmkqwtnrdlacqv). This migration was applied to the database but
-- had no file in the repo, so a rebuild from git alone would have produced an
-- events table with no `slug` column. Reproduced verbatim as applied.
--
-- Phase 3 SEO: events need slug URLs (/dogadjaj/skroz-cinemas-sloga-2026-04-03)
-- in addition to the existing /event/[uuid] route. Slug is unique + nullable
-- so old rows survive while the backfill catches up; promoteEvents.ts will
-- start generating slugs on insert in the matching code change.
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique_idx ON public.events (slug) WHERE slug IS NOT NULL;

-- Backfill: build slug from lowercased title_bs + start date. Diacritic
-- folding + non-alnum stripping is done in two passes for clarity.
WITH gen AS (
  SELECT
    id,
    -- 1) lowercase, fold diacritics that translate map covers (č→c, ž→z, etc.)
    -- 2) replace any non-[a-z0-9] with a hyphen
    -- 3) collapse runs of hyphens, trim leading/trailing
    -- 4) append YYYY-MM-DD from start_datetime in Sarajevo TZ for uniqueness
    regexp_replace(
      regexp_replace(
        translate(
          lower(coalesce(title_bs, title_en, '')),
          'čćšžđáéíóúýüöäëïâêîôûàèìòùÿ',
          'cczzdaeiouyuoaeiaeiouaeiouy'
        ),
        '[^a-z0-9]+', '-', 'g'
      ),
      '(^-+)|(-+$)', '', 'g'
    )
      || '-' || to_char(timezone('Europe/Sarajevo', start_datetime), 'YYYY-MM-DD')
      AS proposed
  FROM public.events
  WHERE slug IS NULL
)
UPDATE public.events e
SET slug = gen.proposed
FROM gen
WHERE e.id = gen.id
  AND gen.proposed IS NOT NULL
  AND gen.proposed <> ''
  AND gen.proposed NOT IN (SELECT slug FROM public.events WHERE slug IS NOT NULL);

-- Anything still null (empty title, or collision after backfill): append the
-- first 8 chars of the UUID so we always have a usable slug.
UPDATE public.events
SET slug = COALESCE(slug, '') || CASE WHEN slug IS NULL OR slug = '' THEN substring(id::text, 1, 8) ELSE '-' || substring(id::text, 1, 8) END
WHERE slug IS NULL OR slug = '';
