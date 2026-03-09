# Open Questions

## Architecture

- Will the product primarily use Supabase directly, the custom backend, or a mixed model?
- Which features are intended to be online-only versus cached/offline friendly?

## Product

- What is the exact MVP scope for venues, events, series, and daily menus?
- Which markets or cities are in scope after Sarajevo?

## Technical debt

- Should duplicated Supabase client code be consolidated in `integrations/` only?
- Do the translation strings need an encoding cleanup pass?
