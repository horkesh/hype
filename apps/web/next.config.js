// Tamagui's next-plugin uses CommonJS internals — keep this file as .js, not
// .ts/.mjs. The plugin runs the @tamagui/static compiler at build time to
// extract Tamagui components into static CSS so we don't ship the whole
// runtime to the client.
const { withTamagui } = require('@tamagui/next-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace packages need transpilation; Tamagui ships as ESM and TS.
  transpilePackages: ['@look/ui', '@look/shared', 'tamagui', 'react-native-web'],
};

module.exports = withTamagui({
  config: '../../packages/ui/src/tamagui.config.ts',
  components: ['@look/ui', 'tamagui'],
  appDir: true,
  outputCSS: process.env.NODE_ENV === 'production' ? './public/tamagui.css' : null,
  disableExtraction: process.env.NODE_ENV === 'development',
})(nextConfig);
