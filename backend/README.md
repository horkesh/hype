## Getting Started

**1. Create a GitHub Personal Access Token:**
- Go to [GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)
- Generate a token with `read:packages` scope

**2. Set the token and install:**
```bash
export NPM_TOKEN=<your-token>
npm install
npm run dev
```

**Important:** Never commit your token. Use environment variables locally or secure secrets in CI/CD.

## Database

This template uses Neon (Postgres) for the database.

**After editing `src/db/schema.ts`, push your changes:**
```bash
npm run db:push
```

This command generates migration files and applies them to the database.

**Or run steps separately:**
```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

## Customization

- Add your API endpoints in `src/index.ts`
- Define your database schema in `src/db/schema.ts`
- Generate and apply migrations as needed

## Current Hype backend role

For Hype, this backend is currently intended to become the orchestration layer for:

- scraper execution
- ingestion status and operator endpoints
- privileged dedupe and promotion workflows

The live Supabase project remains the canonical persistence layer for:

- `scrape_sources`
- `raw_events`
- `scrape_log`

The first repo-native source seed now lives at:

- `backend/sql/initial_scrape_sources_seed.sql`
- `backend/sql/ingestion_operator_queries.sql`
- `backend/sql/venue_reconciliation_queries.sql`
- `backend/sql/events_series_reconciliation_queries.sql`
- `backend/sql/daily_specials_reconciliation_queries.sql`

That seed follows the current source inventory in:

- `docs/03-architecture/initial_source_inventory.md`

The backend currently exposes an initial ingestion route scaffold:

- `GET /ingestion/health`
- `GET /ingestion/sources`
- `GET /ingestion/raw/recent`
- `GET /ingestion/parse-preview`
- `POST /ingestion/run/:sourceId`

`GET /ingestion/sources` can now read live source rows when backend-only Supabase admin credentials are set.

`POST /ingestion/run/:sourceId` now supports first-pass raw intake for `direct_html` sources:

- creates a real `scrape_log` row
- fetches from `scrape_config.list_url` when present, and can expand into `list_urls` or `category_urls`
- applies source-aware extraction for Pozorista, AllEvents, and KupiKartu before generic anchor fallback
- carries first-pass listing metadata such as date, venue, and image into `raw_events` when the source exposes it
- performs limited detail-page enrichment for AllEvents and KupiKartu candidates before raw-row insert
- inserts or skips `raw_events` on non-dry runs

Recommended first activation order after seeding:

1. Pozorista
2. AllEvents
3. KupiKartu

After manual runs, recommended first operator review order is:

1. `GET /ingestion/raw/recent`
2. `GET /ingestion/parse-preview`
3. `backend/sql/ingestion_operator_queries.sql`

For broader live-data reality checks before promotion or import work, also use:

- `backend/sql/venue_reconciliation_queries.sql`
- `backend/sql/events_series_reconciliation_queries.sql`
- `backend/sql/daily_specials_reconciliation_queries.sql`

## Backend-only environment variables

For ingestion/admin reads and writes, configure:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

These should stay backend-only and must not be exposed to the Expo client.

Recommended local location:

- `backend/.env`

Use `backend/.env.example` as the template shape and fill in the real service-role key only on the trusted machine.
