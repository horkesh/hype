
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { requirePublicConfig } from '@/utils/publicConfig';

const supabaseUrl = requirePublicConfig('supabaseUrl', 'Supabase client');
const supabaseAnonKey = requirePublicConfig(
  'supabaseAnonKey',
  'Supabase client',
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
