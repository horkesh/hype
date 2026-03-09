import Constants from 'expo-constants';

type PublicConfigKey =
  | 'supabaseUrl'
  | 'supabaseAnonKey'
  | 'backendUrl'
  | 'openWeatherApiKey';

type PublicConfig = Record<PublicConfigKey, string>;

type ExpoExtraConfig = Partial<Record<PublicConfigKey, string>>;

const expoExtra = (Constants.expoConfig?.extra ?? {}) as ExpoExtraConfig;

function readPublicConfig(
  envName: string,
  extraKey: PublicConfigKey,
): string {
  return process.env[envName] ?? expoExtra[extraKey] ?? '';
}

export const publicConfig: PublicConfig = {
  supabaseUrl: readPublicConfig('EXPO_PUBLIC_SUPABASE_URL', 'supabaseUrl'),
  supabaseAnonKey: readPublicConfig(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    'supabaseAnonKey',
  ),
  backendUrl: readPublicConfig('EXPO_PUBLIC_BACKEND_URL', 'backendUrl'),
  openWeatherApiKey: readPublicConfig(
    'EXPO_PUBLIC_OPENWEATHER_API_KEY',
    'openWeatherApiKey',
  ),
};

export function requirePublicConfig(
  key: keyof PublicConfig,
  context: string,
): string {
  const value = publicConfig[key];

  if (!value) {
    throw new Error(
      `Missing public config "${key}" for ${context}. Set EXPO_PUBLIC_${key
        .replace(/[A-Z]/g, (char) => `_${char}`)
        .toUpperCase()} in your local environment or app config.`,
    );
  }

  return value;
}
