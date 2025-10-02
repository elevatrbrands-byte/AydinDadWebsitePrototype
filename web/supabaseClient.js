// Create a Supabase client
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
window.sb = supabase; // expose for debugging
