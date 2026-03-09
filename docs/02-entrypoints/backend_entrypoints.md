# Backend Entrypoints

## Startup chain

1. `backend/src/index.ts` imports the database schema.
2. `createApplication(schema)` creates the backend app instance.
3. Route registration functions are intended to be called from here.
4. `app.run()` starts the service.

## Development implications

- New backend route modules should be registered from `backend/src/index.ts`.
- Avoid direct circular imports by using registration functions, which the file already hints at in comments.
- Database changes should stay aligned with `backend/src/db/schema/schema.ts` and the migration workflow.
