import type { Metadata } from 'next';
import { Providers } from './providers';
import { Analytics } from './analytics';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://look-app.com'),
  title: { default: 'Look · Sarajevo', template: '%s · Look' },
  description: 'Otkrij Sarajevo. Lokacije, događaji, ljudi.',
  applicationName: 'Look',
  formatDetection: { telephone: false },
  icons: { icon: '/icon-192.png', apple: '/icon-192.png' },
  themeColor: '#121212',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
