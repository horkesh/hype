
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kyfoqltmkqwtnrdlacqv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Zm9xbHRta3F3dG5yZGxhY3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDc4OTUsImV4cCI6MjA4NzU4Mzg5NX0.t2PcTChI16y9NM0HiglcLMTYxTgMqOo8uvXMzs5kZWs';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check configuration.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
