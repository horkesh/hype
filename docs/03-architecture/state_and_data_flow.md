# State And Data Flow

## Frontend shared state

- `contexts/AppContext.tsx` currently owns language selection, theme mode, translation lookup, and preference persistence.
- Storage is platform-aware: web uses `localStorage`, native uses `AsyncStorage`.

## Navigation flow

- Root stack starts in `(tabs)`.
- Tabs navigate into detail routes such as `event/[id]`, `series/[id]`, and `venue/[id]`.

## Data flow notes

- Supabase is the visible data integration on the frontend.
- Backend uses a typed application framework with Drizzle schema support.
- The frontend and backend appear loosely coupled at the moment rather than fully wired end-to-end.

## Architecture watchlist

- Confirm whether Supabase is the primary runtime backend for the app, or whether the custom `backend/` service will become the main API surface.
- Decide which state belongs in context versus route-local component state as the app grows.
