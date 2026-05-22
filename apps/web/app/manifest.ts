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
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    categories: ['lifestyle', 'travel', 'food'],
    lang: 'bs-BA',
  };
}
