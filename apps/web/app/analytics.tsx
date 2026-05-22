// Plausible analytics tag. Privacy-first, EU-hosted, no cookies — picked
// over PostHog/GA4 to keep launch friction low. Only mounts in production
// and only when NEXT_PUBLIC_PLAUSIBLE_DOMAIN is set.

import Script from 'next/script';

export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain || process.env.NODE_ENV !== 'production') return null;
  return (
    <Script
      defer
      data-domain={domain}
      src="https://plausible.io/js/script.js"
      strategy="afterInteractive"
    />
  );
}
