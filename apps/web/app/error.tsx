'use client';

// Per-route error boundary. Renders when a server or client error escapes
// the page. Logs to Sentry (or whatever's wired into reportError) when
// available; falls through to console in dev.

import { useEffect } from 'react';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: Props) {
  useEffect(() => {
    // Phase 6: replace with Sentry.captureException once SENTRY_DSN is set.
    console.error('[route error]', error);
  }, [error]);

  return (
    <main style={{ padding: 48, maxWidth: 560, margin: '0 auto', textAlign: 'center', color: '#F5F5F5' }}>
      <h1 style={{ fontFamily: '"DM Serif Display", serif', fontSize: 32, marginBottom: 8 }}>
        Nešto je krenulo po zlu
      </h1>
      <p style={{ color: '#A1A1AA', marginBottom: 24 }}>
        Naša greška. Pokušaj ponovo, a ako se ponovi, javi nam.
      </p>
      <button
        onClick={reset}
        style={{
          background: '#D4A056',
          color: '#000',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Pokušaj ponovo
      </button>
      {error.digest && (
        <p style={{ color: '#71717A', marginTop: 24, fontSize: 11, fontFamily: 'monospace' }}>
          Digest: {error.digest}
        </p>
      )}
    </main>
  );
}
