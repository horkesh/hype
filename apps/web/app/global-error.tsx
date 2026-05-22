'use client';

// Catches errors in the root layout itself (when layout.tsx or providers
// fail to mount). Must render its own <html>/<body>. Last-resort fallback —
// the per-route error.tsx handles everything inside the layout normally.

import { useEffect } from 'react';

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="bs">
      <body style={{ margin: 0, background: '#121212', color: '#F5F5F5', fontFamily: 'system-ui, sans-serif' }}>
        <main style={{ padding: 48, maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: 32 }}>Aplikacija se ne pokreće</h1>
          <p style={{ color: '#A1A1AA', marginTop: 12 }}>
            Osvježi stranicu. Ako problem ostane, javi nam.
          </p>
        </main>
      </body>
    </html>
  );
}
