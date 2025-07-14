import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Environment-based redirect URL configuration
const getRedirectUrl = () => {
  if (import.meta.env.DEV) {
    console.log('[getRedirectUrl] DEV mode: using localhost redirect');
    return 'http://localhost:5173/lesson/intro';
  } else {
    const envUrl = import.meta.env.VITE_PRODUCTION_URL;
    const url = envUrl
      ? `${envUrl}/lesson/intro`
      : 'https://captain-spark.vercel.app/lesson/intro';
    console.log('[getRedirectUrl] PROD mode:', {
      VITE_PRODUCTION_URL: envUrl,
      redirectUrl: url
    });
    return url;
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export the redirect URL function for use in components
export { getRedirectUrl }; 