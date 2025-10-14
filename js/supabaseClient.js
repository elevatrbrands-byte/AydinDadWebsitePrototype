const SUPABASE_URL = window.__env?.SUPABASE_URL || 'https://befuoraecgrrorlfgfhm.supabase.co';
const SUPABASE_ANON_KEY =
  window.__env?.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJlZnVvcmFlY2dycm9ybGZnZmhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2ODkwNjYsImV4cCI6MjA3NDI2NTA2Nn0.2iKmQhtTiS9DAniPE9mBy0100HzMtIkc49HBpaZow4s';

if (!window.supabase) {
  throw new Error('Supabase client library failed to load.');
}

export const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
