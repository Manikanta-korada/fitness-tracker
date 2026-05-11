import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qzclbwnfnxxclyvqucrg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-Biw2tK9J0B1F8v2gOZc-g_MuP7bWvd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
