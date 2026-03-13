import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Hype',
  slug: 'hype',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/app-icon-kdx.png',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/app-icon-kdx.png',
    resizeMode: 'contain',
    backgroundColor: '#000000',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.placeholder.app',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/app-icon-kdx.png',
      backgroundColor: '#000000',
    },
    edgeToEdgeEnabled: true,
    package: 'com.placeholder.app',
  },
  web: {
    favicon: './assets/images/final_quest_240x240.png',
    bundler: 'metro',
  },
  plugins: ['expo-font', 'expo-router', 'expo-web-browser'],
  scheme: 'hype',
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? '',
    openWeatherApiKey: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ?? '',
  },
});
