import type { MetadataRoute } from 'next';

// PWA manifest. Lets users install Look to home screen on Android + iOS.
// Service worker is optional for installability now (Chrome 102+ relaxed
// the requirement), but having one improves offline-startup. Phase 5+
// adds a Workbox/Serwist precache; for now the manifest stands alone.

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Look · Sarajevo',
    short_name: 'Look',
    description: 'Otkrij Sarajevo. Lokacije, događaji, planovi za večeras.',
    start_url: '/',
    display: 'standalone',
    background_color: '#121212',
    theme_color: '#D4A056',
    orientation: 'portrait',
    // SVG icons — vector, infinitely-scalable, ~400 bytes each. PWA-compliant
    // since Chrome 88. Designed in-repo as fallback; replace with rasterised
    // versions if/when a designer ships PNGs.
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
    ],
    categories: ['lifestyle', 'travel', 'food'],
    lang: 'bs-BA',
  };
}
