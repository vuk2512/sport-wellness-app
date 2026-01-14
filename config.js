// config.js - Supabase configuration
const SUPABASE_URL = 'https://pknkraqkgamrsoppcnpo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_W6thUwEBORt66nn5aYxYOw_f5ZsrnBc';

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabase = supabaseClient;