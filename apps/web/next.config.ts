import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Phase 1 will add @tamagui/next-plugin here and transpilePackages for the
  // @look/shared + @look/ui workspace deps. For Phase 0 a vanilla Next config
  // is enough to verify the workspace boots.
};

export default config;
