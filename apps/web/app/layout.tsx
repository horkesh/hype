import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Look — Sarajevo',
  description: 'Otkrij Sarajevo. Lokacije, događaji, ljudi.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bs">
      <body>{children}</body>
    </html>
  );
}
