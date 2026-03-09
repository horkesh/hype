# Next Milestone

## Name

Stabilize the mobile prototype into a reliable v0.1 app

## Why this is next

The app already covers much of the intended mobile surface area, but several screens are still fragile and the backend/data ownership model is not yet clearly settled.

Adding more features before stabilizing the current prototype would increase rework and make architectural decisions harder later.

## Outcomes

- all current major screens load without runtime crashes
- route-to-route navigation works consistently
- current data contracts are documented
- Supabase client usage is consolidated or clearly defined
- backend direction is explicit enough for next-phase work

## Work buckets

### 1. Runtime stability

- validate Home
- validate Explore
- validate Tonight
- validate Saved
- validate Profile
- validate Event / Venue / Series detail routes

### 2. Data contract cleanup

- compare UI field expectations with `..\hype-supabase-schema.sql`
- note missing or inconsistent fields
- reduce duplicate integration setup

### 3. Documentation alignment

- expand `docs/04-product/screen_inventory.md`
- keep `docs/project_ledger.md` current
- capture one backend-direction ADR if the decision is made

## Definition of done

- no known repeated runtime lifecycle bugs on the main route set
- one clear statement of backend/data ownership exists in docs
- the current app can be described accurately without guessing which prompt features were actually implemented
