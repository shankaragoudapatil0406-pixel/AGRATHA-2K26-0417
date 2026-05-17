/**
 * AGRATHA 2K26 - Supabase Configuration
 * Initialize Supabase client for auth, database, and realtime
 */

const SUPABASE_URL = "https://xbbjnuhdlvnwnbjdacal.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_2NtaqhSOA9HdKdO1pKJvzw__9SdW_Ko";

// Initialize Supabase client with error handling
try {
  if (typeof window.supabase !== 'undefined' && typeof window.supabase.createClient === 'function') {
    window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
    console.log('✅ Supabase client initialized successfully');
    console.log('📡 URL:', SUPABASE_URL);
  } else {
    console.error('❌ Supabase library not loaded. Check CDN script tag.');
    window.supabase = null;
  }
} catch (err) {
  console.error('❌ Supabase init failed:', err.message);
  window.supabase = null;
}

/**
 * Check if Supabase is connected and working
 * @returns {Promise<boolean>}
 */
async function checkSupabaseConnection() {
  if (!window.supabase) {
    console.error('❌ Supabase client is null');
    return false;
  }
  try {
    const { data, error } = await window.supabase.from('events').select('id').limit(1);
    if (error) {
      console.error('❌ Supabase connection test failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection verified — events table accessible');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection error:', err.message);
    return false;
  }
}
