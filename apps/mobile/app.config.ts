import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Look',
  slug: 'look',
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
    associatedDomains: ['applinks:look-sarajevo.vercel.app'],
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/app-icon-kdx.png',
      backgroundColor: '#000000',
    },
    edgeToEdgeEnabled: true,
    package: 'com.placeholder.app',
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'https',
            host: 'look-sarajevo.vercel.app',
            pathPrefix: '/venue',
          },
          {
            scheme: 'https',
            host: 'look-sarajevo.vercel.app',
            pathPrefix: '/event',
          },
          {
            scheme: 'https',
            host: 'look-sarajevo.vercel.app',
            pathPrefix: '/series',
          },
          {
            scheme: 'https',
            host: 'look-sarajevo.vercel.app',
            pathPrefix: '/heritage',
          },
        ],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
  },
  web: {
    favicon: './assets/images/final_quest_240x240.png',
    bundler: 'metro',
  },
  plugins: ['expo-font', 'expo-router', 'expo-web-browser', '@react-native-community/datetimepicker'],
  scheme: 'look',
  experiments: {
    typedRoutes: true,
  },
  extra: {
    router: {},
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    backendUrl: process.env.EXPO_PUBLIC_BACKEND_URL ?? '',
  },
});
