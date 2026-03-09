# Backend Map

## Backend structure

- `backend/src/index.ts`: backend startup.
- `backend/src/db/migrate.ts`: migration runner.
- `backend/src/db/schema/schema.ts`: database schema definitions.
- `backend/tests/`: backend integration helpers and tests.

## Backend scripts

- `npm run dev`: watch and run backend source.
- `npm run build`: bundle backend into `dist/`.
- `npm run typecheck`: run TypeScript without emitting files.
- `npm run start`: run the built backend.
- `npm run db:generate`: generate Drizzle artifacts.
- `npm run db:migrate`: run migrations.
- `npm run db:push`: generate then migrate.

## Current backend maturity

- The framework app is created and run in `src/index.ts`.
- Route registration is still commented out, so the backend appears scaffolded and ready for feature modules rather than already feature-rich.
