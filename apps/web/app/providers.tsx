'use client';

import { TamaguiProvider, config } from '@look/ui';
import * as React from 'react';

// Wraps the app in TamaguiProvider on the client side. RSC pages render
// without this and pick up the static-extracted CSS instead; client
// components inside ('use client' tree) get the full Tamagui runtime.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      {children}
    </TamaguiProvider>
  );
}
