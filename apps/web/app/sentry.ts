// Sentry init scaffold. The actual @sentry/nextjs package isn't installed
// yet — when SENTRY_DSN is set in env, install the package + replace this
// stub with the full Sentry.init() call.
//
// Why deferred: Sentry @sentry/nextjs is ~250 KB on the wire and we don't
// want that on day-one perf budget unless we're actually catching errors
// somewhere. Phase 6 manual: sign up for Sentry, get DSN, paste in env,
// run pnpm add @sentry/nextjs, follow Sentry's Next.js setup wizard.

export function maybeInitSentry(): void {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  // eslint-disable-next-line no-console
  console.info('[sentry] DSN present but @sentry/nextjs not installed — see apps/web/app/sentry.ts');
}
