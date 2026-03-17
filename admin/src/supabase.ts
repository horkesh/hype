import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL || 'https://kyfoqltmkqwtnrdlacqv.supabase.co';
const key = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5Zm9xbHRta3F3dG5yZGxhY3F2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDc4OTUsImV4cCI6MjA4NzU4Mzg5NX0.t2PcTChI16y9NM0HiglcLMTYxTgMqOo8uvXMzs5kZWs';

export const supabase = createClient(url, key);
